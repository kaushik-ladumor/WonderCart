const MasterOrder = require("../Models/MasterOrder.Model");
const SubOrder = require("../Models/SubOrder.Model");
const Product = require("../Models/Product.Model");
const Cart = require("../Models/Cart.Model");
const User = require("../Models/User.Model");
const SellerProfile = require("../Models/SellerProfile.Model");
const WalletTransaction = require("../Models/WalletTransaction.Model");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { calculateEDD, getZone, isCodServiceable } = require("../Utils/Logistics");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const customerOrderPopulate = {
  path: "subOrders",
  populate: [
    { path: "seller", select: "shopName" },
    { path: "items.product", select: "name image images variants" },
  ],
};

/**
 * Split items by seller and prepare sub-orders data
 */
const prepareOrderSplitting = async (items, customerPin) => {
  const sellerGroups = {};

  if (!customerPin) {
    throw new Error("Shipping address is missing a valid pincode.");
  }

  for (const item of items) {
    const product = await Product.findById(item.product).populate("owner");
    if (!product) throw new Error(`Product ${item.name || item.product} not found or no longer available.`);

    if (!product.owner) {
      throw new Error(`Product ${product.name} does not have a valid seller associated.`);
    }

    const sellerId = product.owner._id.toString();
    if (!sellerGroups[sellerId]) {
      const sellerProfile = await SellerProfile.findOne({ user: sellerId });
      sellerGroups[sellerId] = {
        seller: sellerId,
        sellerPin: sellerProfile?.businessAddress?.pinCode || "110001",
        handlingDays: sellerProfile?.handlingTimeDays || 2,
        commissionRate: sellerProfile?.platformCommissionRate || 10,
        items: [],
        subTotal: 0,
      };
    }

    if (!product.variants || product.variants.length === 0) {
      throw new Error(`Product ${product.name} has no available variants.`);
    }

    // Try to find exact color match, otherwise fallback to first variant
    let variant = product.variants.find(v => v.color === item.color);
    if (!variant) {
      console.warn(`Color ${item.color} not found for product ${product.name}, falling back to default variant.`);
      variant = product.variants[0];
    }

    if (!variant.sizes || variant.sizes.length === 0) {
      throw new Error(`No sizes available for product ${product.name} in ${variant.color} variant.`);
    }

    const sizeObj = variant.sizes.find(s => s.size === item.size);
    if (!sizeObj) {
      throw new Error(`Size ${item.size} not found for ${product.name} (${variant.color}). Available: ${variant.sizes.map(s => s.size).join(", ")}`);
    }

    if (sizeObj.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (${item.size}, ${variant.color}). Available: ${sizeObj.stock}`);
    }

    const price = sizeObj.sellingPrice;
    sellerGroups[sellerId].items.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: price,
      color: variant.color,
      size: item.size,
      category: product.category,
    });
    sellerGroups[sellerId].subTotal += price * item.quantity;
  }

  // Finalize sub-orders with EDD and Commission
  const subOrdersData = Object.values(sellerGroups).map(group => {
    const zone = getZone(group.sellerPin, customerPin);
    const edd = calculateEDD(new Date(), group.handlingDays, zone);
    const commission = Math.round((group.subTotal * group.commissionRate) / 100);
    
    // SLA ship by date (roughly T0 + handling days)
    const mustShipBy = new Date();
    mustShipBy.setDate(mustShipBy.getDate() + group.handlingDays);

    return {
      ...group,
      zone,
      estimatedDeliveryDate: edd,
      platformCommission: commission,
      sellerPayout: group.subTotal - commission,
      mustShipBy,
      shippingCost: group.subTotal < 999 ? 50 : 0, // Independent shipping per seller
    };
  });

  return subOrdersData;
};

/**
 * Handle Order Creation (Common for Online/Wallet/COD)
 */
const createFinalOrders = async (session, masterData, subOrdersData) => {
  // 1. Create Master Order
  const lastOrder = await MasterOrder.findOne().sort({ createdAt: -1 });
  const nextId = lastOrder ? parseInt(lastOrder.orderId.split("-")[1]) + 1 : 1001;
  const masterOrderIdStr = `ORD-${nextId}`;

  const masterOrder = new MasterOrder({
    ...masterData,
    orderId: masterOrderIdStr,
  });

  const subOrderIds = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < subOrdersData.length; i++) {
    const data = subOrdersData[i];
    const subOrder = new SubOrder({
      subOrderId: `${masterOrderIdStr}-${alphabet[i]}`,
      masterOrder: masterOrder._id,
      seller: data.seller,
      items: data.items,
      subTotal: data.subTotal,
      shippingCost: data.shippingCost,
      platformCommission: data.platformCommission,
      sellerPayout: data.sellerPayout,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
      mustShipBy: data.mustShipBy,
      zone: data.zone,
      handlingTimeDays: data.handlingDays,
      status: masterData.paymentMethod === "COD" ? "PLACED" : "CONFIRMED",
      paymentStatus: masterData.paymentStatus,
    });

    await subOrder.save({ session });
    subOrderIds.push(subOrder._id);

    // 2. Deduct Stock
    for (const item of data.items) {
      await Product.updateOne(
        { _id: item.product, "variants.color": item.color, "variants.sizes.size": item.size },
        { $inc: { "variants.$[v].sizes.$[s].stock": -item.quantity } },
        {
          arrayFilters: [{ "v.color": item.color }, { "s.size": item.size }],
          session
        }
      );
    }
  }

  masterOrder.subOrders = subOrderIds;
  await masterOrder.save({ session });

  // 3. Clear Cart
  await Cart.updateOne({ user: masterData.user }, { $set: { items: [] } }, { session });

  return masterOrder;
};

/**
 * API: Initialize Checkout / Place Order
 */
const placeOrder = async (req, res) => {
  console.log("[OrderCreate] Request received:", JSON.stringify(req.body, null, 2));
  const { items, addressId, paymentMethod, walletUsed, couponCode } = req.body;
  const userId = req.user.userId;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items found to place order." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userDoc = await User.findById(userId);
    if (!userDoc) throw new Error("User account not found.");

    const selectedAddress = userDoc.addresses.id(addressId);
    if (!selectedAddress) throw new Error("Shipping address not selected.");

    const zipCode = selectedAddress.zipCode || selectedAddress.zipcode;
    if (!zipCode) throw new Error("Shipping address is missing a pincode.");

    const formattedAddress = {
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipCode: zipCode,
      country: selectedAddress.country || "India"
    };

    // 1. Prepare and Split
    const subOrdersData = await prepareOrderSplitting(items, zipCode);
    
    const subTotal = subOrdersData.reduce((sum, s) => sum + s.subTotal, 0);
    const shipping = subOrdersData.reduce((sum, s) => sum + s.shippingCost, 0);
    const tax = Math.round(subTotal * 0.18);
    const codFee = paymentMethod === "COD" ? 50 : 0;
    
    // Verify COD serviceability
    if (paymentMethod === "COD") {
      if (!isCodServiceable(zipCode)) {
        if (global.io) global.io.to(`buyer-${userId}`).emit("payment-fail", { message: "COD not serviceable for this pincode." });
        throw new Error("Cash on Delivery (COD) is not available for this pincode.");
      }
      if (subTotal + tax + shipping > 5000) {
        if (global.io) global.io.to(`buyer-${userId}`).emit("payment-fail", { message: "COD limit exceeded." });
        throw new Error("COD is only available for orders below ₹5000.");
      }
    }

    const totalAmount = subTotal + tax + shipping + codFee;

    // 2. Wallet Logic
    let walletDeduction = 0;
    if (walletUsed) {
      const user = await User.findById(userId).session(session);
      if (user.walletBalance < walletUsed) {
        throw new Error("Insufficient wallet balance.");
      }
      walletDeduction = walletUsed;
      user.walletBalance -= walletDeduction;
      await user.save({ session });

      await WalletTransaction.create([{
        user: userId,
        amount: walletDeduction,
        type: "debit",
        source: "order_payment",
        description: `Order payment for ${totalAmount}`,
      }], { session });
    }

    const remainingAmount = totalAmount - walletDeduction;

    // 3. Handle Payment Methods
    if (paymentMethod === "Razorpay" && remainingAmount > 0) {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(remainingAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      await session.commitTransaction();
      return res.status(200).json({
        success: true,
        razorpayOrder: rzpOrder,
        walletUsed: walletDeduction,
        remainingAmount,
      });
    }

    // 4. Finalize COD or Full Wallet Order
    const masterData = {
      user: userId,
      totalAmount,
      walletAmount: walletDeduction,
      onlineAmount: 0,
      codFee,
      address: formattedAddress,
      paymentMethod: remainingAmount === 0 ? "Wallet" : (walletDeduction > 0 ? "Partial" : paymentMethod),
      paymentStatus: paymentMethod === "COD" ? "COD_PENDING" : "paid",
    };

    const masterOrder = await createFinalOrders(session, masterData, subOrdersData);

    await session.commitTransaction();

    if (global.io) {
      global.io.to(`buyer-${userId}`).emit("payment-success", {
        orderId: masterOrder.orderId,
        message: "Your order has been placed successfully!"
      });
    }

    res.status(201).json({ success: true, order: masterOrder });

  } catch (error) {
    console.error("Order Creation Logic Error:", error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * API: Verify Payment & Create Order
 */
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
  const userId = req.user.userId;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    if (global.io) global.io.to(`buyer-${userId}`).emit("payment-fail", { message: "Signature verification failed." });
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userDoc = await User.findById(userId);
    const selectedAddress = userDoc.addresses.id(orderData.addressId);
    if (!selectedAddress) throw new Error("Shipping address not found");

    const zipCode = selectedAddress.zipCode || selectedAddress.zipcode;
    const formattedAddress = {
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipCode: zipCode,
      country: selectedAddress.country || "India"
    };

    const subOrdersData = await prepareOrderSplitting(orderData.items, zipCode);
    
    const subTotal = subOrdersData.reduce((sum, s) => sum + s.subTotal, 0);
    const shipping = subOrdersData.reduce((sum, s) => sum + s.shippingCost, 0);
    const tax = Math.round(subTotal * 0.18);
    const totalAmount = subTotal + tax + shipping;

    const masterData = {
      user: userId,
      totalAmount,
      walletAmount: orderData.walletUsed || 0,
      onlineAmount: (orderData.totalAmount || totalAmount) - (orderData.walletUsed || 0),
      codFee: 0,
      address: formattedAddress,
      paymentMethod: orderData.walletUsed > 0 ? "Partial" : "Razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };

    const masterOrder = await createFinalOrders(session, masterData, subOrdersData);

    await session.commitTransaction();

    if (global.io) {
      global.io.to(`buyer-${userId}`).emit("payment-success", {
        orderId: masterOrder.orderId,
        message: "Payment verified successfully!"
      });
    }

    res.status(201).json({ success: true, order: masterOrder });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * API: Get My Orders (Master Orders with Sub Orders populated)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await MasterOrder.find({ user: req.user.userId })
      .populate(customerOrderPopulate)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * API: Get Seller Orders (Only their SubOrders)
 */
const getSellerOrders = async (req, res) => {
  try {
    const orders = await SubOrder.find({ seller: req.user.userId })
      .populate({
        path: "masterOrder",
        populate: { path: "user", select: "name email phone" }
      })
      .populate("items.product", "name variants")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * API: Update Sub-Order Status
 */
const updateSubOrderStatus = async (req, res) => {
  const { subOrderId } = req.params;
  const { status, trackingId } = req.body;
  const sellerId = req.user.userId;

  try {
    const subOrder = await SubOrder.findOne({ _id: subOrderId, seller: sellerId });
    if (!subOrder) {
      return res.status(404).json({ success: false, message: "Sub-order not found" });
    }

    const previousStatus = subOrder.status;

    if (status) subOrder.status = status;
    if (trackingId) subOrder.trackingId = trackingId;

    if (status === "DELIVERED" && previousStatus !== "DELIVERED") {
      subOrder.deliveredAt = new Date();
      
      // RELEASE PAYOUT TO SELLER WALLET
      const seller = await User.findById(sellerId);
      if (seller) {
        seller.walletBalance = (seller.walletBalance || 0) + subOrder.sellerPayout;
        await seller.save();

        await WalletTransaction.create({
          user: sellerId,
          amount: subOrder.sellerPayout,
          type: "credit",
          source: "seller_payout",
          description: `Payout released for ${subOrder.subOrderId}`,
        });
      }
    }

    await subOrder.save();

    // ✅ Emit socket update to customer
    if (global.io) {
      const master = await MasterOrder.findById(subOrder.masterOrder);
      if (master) {
        global.io.to(`buyer-${master.user}`).emit("order-status-update", {
          subOrderId: subOrder.subOrderId,
          status: subOrder.status,
          message: `📦 Package ${subOrder.subOrderId} is now ${subOrder.status}`
        });
      }
    }

    res.status(200).json({ success: true, message: "Status updated", subOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * API: Track Order (Master or SubOrder)
 */
const trackOrder = async (req, res) => {
  const { id } = req.params; // Generic ID, could be ORD-1001 or ORD-1001-A or ObjectId

  try {
    let query = {};
    if (id.startsWith("ORD-")) {
      if (id.includes("-", 4)) {
        // It's a SubOrder ID like ORD-1001-A
        const subOrder = await SubOrder.findOne({ subOrderId: id }).populate("masterOrder");
        if (!subOrder) return res.status(404).json({ success: false, message: "Sub-order not found" });
        
        // Return full MasterOrder so customer sees all packages
        const masterOrder = await MasterOrder.findById(subOrder.masterOrder).populate({
          path: "subOrders",
          populate: [
            { path: "seller", select: "shopName" },
            { path: "items.product", select: "name image images variants" },
          ]
        });
        return res.status(200).json({ success: true, order: masterOrder });
      } else {
        // It's a MasterOrder ID like ORD-1001
        query = { orderId: id };
      }
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const masterOrder = await MasterOrder.findOne(query).populate(customerOrderPopulate);

    if (!masterOrder) {
      // Check if it's a SubOrder ObjectId
      const subOrder = await SubOrder.findById(id).populate("masterOrder");
      if (subOrder) {
        const fullMaster = await MasterOrder.findById(subOrder.masterOrder).populate({
          path: "subOrders",
          populate: [
            { path: "seller", select: "shopName" },
            { path: "items.product", select: "name image images variants" },
          ]
        });
        return res.status(200).json({ success: true, order: fullMaster });
      }
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order: masterOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * API: Get Seller Sub Order by ID
 */
const getSellerSubOrderById = async (req, res) => {
  try {
    const order = await SubOrder.findOne({ _id: req.params.orderId, seller: req.user.userId })
      .populate({
        path: "masterOrder",
        populate: { path: "user", select: "name email phone" }
      })
      .populate("items.product", "name image variants color sizes");

    if (!order) return res.status(404).json({ success: false, message: "Sub-order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * API: Get Master Order by ID (For Customers)
 */
const getMasterOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    let query = { user: req.user.userId };
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query._id = orderId;
    } else {
      query.orderId = orderId;
    }

    const order = await MasterOrder.findOne(query).populate(customerOrderPopulate);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  verifyPayment,
  getMyOrders,
  getMasterOrderById,
  getSellerOrders,
  getSellerSubOrderById,
  updateSubOrderStatus,
  trackOrder,
};
