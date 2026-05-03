const MasterOrder = require("../Models/MasterOrder.Model");
const SubOrder = require("../Models/SubOrder.Model");
const Product = require("../Models/Product.Model");
const Cart = require("../Models/Cart.Model");
const User = require("../Models/User.Model");
const SellerProfile = require("../Models/SellerProfile.Model");
const WalletTransaction = require("../Models/WalletTransaction.Model");
const Notification = require("../Models/Notification.Model");
const Coupon = require("../Models/Coupon.Model");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { calculateEDD, getZone, isCodServiceable } = require("../Utils/Logistics");
const { sendNotification, notifyAdmins } = require("../Utils/notificationHelper");

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

const CouponService = require("../Services/Coupon.Service");
const ReferralService = require("../Services/Referral.Service");

/**
 * Split items by seller and prepare sub-orders data
 */
const prepareOrderSplitting = async (items, customerPin) => {
  const sellerGroups = {};

  for (const item of items) {
    console.log(`[DEBUG] Finding product for item:`, item.product);
    const product = await Product.findById(item.product).populate("owner");
    
    if (!product) {
      console.error(`[DEBUG] CRITICAL: Product not found for ID: ${item.product}. Payload:`, item);
      throw new Error(`Product "${item.name || "ID: " + item.product}" not found in our records.`);
    }
    
    console.log(`[DEBUG] Found product: ${product.name} (Seller: ${product.owner?.shopName})`);

    const sellerId = product.owner._id.toString();
    if (!sellerGroups[sellerId]) {
      const sellerProfile = await SellerProfile.findOne({ user: sellerId });
      sellerGroups[sellerId] = {
        seller: sellerId,
        sellerPin: sellerProfile?.businessAddress?.pinCode || "110001",
        handlingDays: sellerProfile?.handlingTimeDays || 2,
        commissionRate: 50, // Flat ₹50 platform fee
        items: [],
        subTotal: 0,
      };
    }

    const variant = product.variants.find(v => v.color === item.color) || product.variants[0];
    const sizeObj = variant.sizes.find(s => s.size === item.size);
    if (!sizeObj) throw new Error(`Size ${item.size} not found for ${product.name}`);

    const price = sizeObj.sellingPrice;
    sellerGroups[sellerId].items.push({
      product: product._id,
      name: product.name,
      image: variant.images?.[0] || "",
      quantity: item.quantity,
      price: price,
      color: variant.color,
      size: item.size,
      category: product.category,
    });
    sellerGroups[sellerId].subTotal += price * item.quantity;
  }

  // Finalize sub-orders with EDD, Tax, and Commission
  return Object.values(sellerGroups).map(group => {
    const zone = getZone(group.sellerPin, customerPin);
    const edd = calculateEDD(new Date(), group.handlingDays, zone);
    const commission = 50; // Fixed ₹50 per seller
    const tax = 0; // GST is already included in the selling price
    
    const mustShipBy = new Date();
    mustShipBy.setDate(mustShipBy.getDate() + group.handlingDays);

    return {
      ...group,
      zone,
      taxAmount: tax,
      estimatedDeliveryDate: edd,
      platformCommission: commission,
      sellerPayout: group.subTotal - commission, // Seller gets full amount - ₹50 fee
      mustShipBy,
      shippingCost: group.subTotal < 999 ? 50 : 0,
    };
  });
};

const createFinalOrders = async (session, masterData, subOrdersData) => {
  const lastOrder = await MasterOrder.findOne().sort({ createdAt: -1 });
  const nextId = lastOrder && lastOrder.orderId ? parseInt(lastOrder.orderId.split("-")[1]) + 1 : 1001;
  const masterOrderIdStr = `ORD-${nextId}`;

  const masterOrder = new MasterOrder({
    ...masterData,
    orderId: masterOrderIdStr,
  });

  const subOrderIds = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const combinedSubOrdersTotal = subOrdersData.reduce((sum, d) => sum + (d.subTotal + d.taxAmount + d.shippingCost), 0);

  for (let i = 0; i < subOrdersData.length; i++) {
    const data = subOrdersData[i];
    const subOrderTotalWithTaxAndShipping = data.subTotal + data.taxAmount + data.shippingCost;
    const proportion = combinedSubOrdersTotal > 0 ? subOrderTotalWithTaxAndShipping / combinedSubOrdersTotal : 0;
    const subOrderDiscount = Math.round(masterData.couponDiscount * proportion);
    const customerPaid = subOrderTotalWithTaxAndShipping - subOrderDiscount;

    const subOrder = new SubOrder({
      subOrderId: `${masterOrderIdStr}-${alphabet[i]}`,
      masterOrder: masterOrder._id,
      seller: data.seller,
      items: data.items,
      subTotal: data.subTotal,
      shippingCost: data.shippingCost,
      taxAmount: data.taxAmount,
      discountAmount: subOrderDiscount,
      customerPaid: customerPaid,
      platformCommission: data.platformCommission,
      sellerPayout: data.sellerPayout,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
      mustShipBy: data.mustShipBy,
      zone: data.zone,
      handlingTimeDays: data.handlingDays,
      status: "placed",
      statusHistory: [{ from: "", to: "placed", reason: "Order placed" }],
      paymentStatus: (masterData.paymentStatus === "paid" || masterData.paymentStatus === "COD_PENDING") ? "pending" : "pending",
    });

    if (masterData.paymentStatus === "paid") {
       subOrder.status = "confirmed";
       subOrder.statusHistory.push({ from: "placed", to: "confirmed", reason: "Payment confirmed" });
       subOrder.paymentStatus = "paid";

       // --- 🚀 RAZORPAY ROUTE: CREATE HELD TRANSFER ---
       if (masterData.razorpayPaymentId) {
          try {
            const sellerProfile = await SellerProfile.findOne({ user: data.seller });
            if (sellerProfile && sellerProfile.razorpayAccountId) {
                const transferAmountPaise = Math.round(data.sellerPayout * 100);
                const transfer = await razorpay.payments.transfer(masterData.razorpayPaymentId, {
                  transfers: [
                    {
                      account: sellerProfile.razorpayAccountId,
                      amount: transferAmountPaise,
                      currency: "INR",
                      notes: {
                        sub_order_id: subOrder.subOrderId,
                        master_order_id: masterOrderIdStr
                      },
                      on_hold: 1 // 🔥 Hold until delivery
                    }
                  ]
                });
                subOrder.razorpayTransferId = transfer.items[0].id;
                console.log(`✅ Transfer created (held): ${subOrder.razorpayTransferId} for ${subOrder.subOrderId}`);
            }
          } catch (rzpErr) {
            console.error(`❌ Razorpay Transfer Creation Error:`, rzpErr.message);
          }
       }
    } else if (masterData.paymentMethod === "COD") {
       subOrder.paymentStatus = "pending";
    }

    await subOrder.save({ session });
    subOrderIds.push(subOrder._id);

    // 📩 Notification for Seller
    sendNotification({
        userId: data.seller,
        role: 'seller',
        type: 'NEW_ORDER',
        message: `New order received: ${subOrder.subOrderId}. Check your dashboard.`,
        orderId: masterOrder._id
    });

    // Stock Management
    for (const item of data.items) {
      await Product.updateOne(
        { _id: item.product, "variants.color": item.color, "variants.sizes.size": item.size },
        { $inc: { "variants.$[v].sizes.$[s].stock": -item.quantity } },
        { arrayFilters: [{ "v.color": item.color }, { "s.size": item.size }], session }
      );
    }
  }

  masterOrder.subOrders = subOrderIds;
  masterOrder.status = await masterOrder.computeStatus();
  
  // If order has a coupon, lock it
  if (masterOrder.coupon) {
    await CouponService.lockCoupon(masterOrder.coupon, masterOrder.user, masterOrder._id, masterOrder.couponDiscount);
  }

  await masterOrder.save({ session });
  await Cart.updateOne({ user: masterData.user }, { $set: { items: [] } }, { session });

  // 📩 Notification for Buyer
  sendNotification({
      userId: masterOrder.user,
      role: 'buyer',
      type: 'ORDER_PLACED',
      message: `Your order ${masterOrder.orderId} has been placed successfully!`,
      orderId: masterOrder._id
  });

  // 📩 Notification for Admin
  notifyAdmins({
      type: 'NEW_ORDER',
      message: `New platform order: ${masterOrder.orderId} (₹${masterOrder.totalAmount})`,
      orderId: masterOrder._id
  });

  return masterOrder;
};

const placeOrder = async (req, res) => {
  const { items, addressId, paymentMethod, walletUsed, couponCode } = req.body;
  const userId = req.user.userId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userDoc = await User.findById(userId);
    const selectedAddress = userDoc.addresses.id(addressId);
    if (!selectedAddress) throw new Error("Address not found");
    
    const zipCode = selectedAddress.zipCode || selectedAddress.zipcode;
    const subOrdersData = await prepareOrderSplitting(items, zipCode);

    const subTotal = subOrdersData.reduce((sum, s) => sum + s.subTotal, 0);
    const shipping = subOrdersData.reduce((sum, s) => sum + s.shippingCost, 0);
    const tax = subOrdersData.reduce((sum, s) => sum + s.taxAmount, 0);
    const codFee = paymentMethod === "COD" ? 0 : 0; // Removed cod fee as per new rules (₹50 is platform fee from seller)
    
    let couponDiscount = 0;
    let couponId = null;
    let finalShipping = shipping;

    if (couponCode) {
        const validation = await CouponService.validateCoupon(couponCode, userId, items, subTotal, paymentMethod);
        couponDiscount = validation.discount;
        couponId = validation.coupon._id;
        
        if (validation.coupon.couponType === 'free_shipping') {
            finalShipping = 0;
            couponDiscount = shipping; // Free shipping is treated as a discount equal to shipping cost
        }
    }
    
    const totalAmount = Math.round(subTotal + tax + finalShipping - couponDiscount);

    let walletDeduction = 0;
    if (walletUsed) {
      if (userDoc.walletBalance < walletUsed) throw new Error("Insufficient wallet balance.");
      walletDeduction = Math.min(walletUsed, totalAmount);
      userDoc.walletBalance -= walletDeduction;
      await userDoc.save({ session });
      await WalletTransaction.create([{ 
          user: userId, 
          amount: walletDeduction, 
          type: "debit", 
          source: "order_payment", 
          description: "Order creation" 
      }], { session });
    }

    const remainingAmount = totalAmount - walletDeduction;
    if (paymentMethod === "Razorpay" && remainingAmount > 0) {
      const rzpOrder = await razorpay.orders.create({ 
          amount: Math.round(remainingAmount * 100), 
          currency: "INR", 
          receipt: `receipt_${Date.now()}` 
      });
      await session.commitTransaction();
      return res.status(200).json({ 
          success: true, 
          razorpayOrder: rzpOrder, 
          walletUsed: walletDeduction, 
          remainingAmount,
          couponCode,
          couponDiscount
      });
    }

    const masterData = {
      user: userId,
      totalAmount,
      walletAmount: walletDeduction,
      onlineAmount: 0,
      codFee: 0,
      address: { 
          fullName: selectedAddress.fullName, 
          phone: selectedAddress.phone, 
          street: selectedAddress.street, 
          city: selectedAddress.city, 
          state: selectedAddress.state, 
          zipCode, 
          country: selectedAddress.country || "India" 
      },
      paymentMethod: remainingAmount === 0 ? "Wallet" : paymentMethod,
      paymentStatus: remainingAmount === 0 ? "paid" : (paymentMethod === "COD" ? "COD_PENDING" : "pending"),
      coupon: couponId,
      couponCode: couponCode,
      couponDiscount: couponDiscount
    };

    const masterOrder = await createFinalOrders(session, masterData, subOrdersData);
    await session.commitTransaction();

    res.status(201).json({ success: true, order: masterOrder });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};


const cancelOrder = async (req, res) => {
  const { subOrderId, reason } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    // Find sub-order by human-readable subOrderId or Mongo ID
    let subOrder = await SubOrder.findOne({ subOrderId: subOrderId });
    if (!subOrder && mongoose.Types.ObjectId.isValid(subOrderId)) {
      subOrder = await SubOrder.findById(subOrderId);
    }

    if (!subOrder) return res.status(404).json({ success: false, message: "Sub-order not found" });

    // Validate ownership (if user)
    const masterOrder = await MasterOrder.findById(subOrder.masterOrder);
    if (!masterOrder) return res.status(404).json({ success: false, message: "Master order not found" });

    if (role === 'user' && masterOrder.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const statusWeights = {
      "placed": 1,
      "confirmed": 2,
      "processing": 3,
      "shipped": 4,
      "out_for_delivery": 5,
      "delivered": 6
    };

    const isCustomer = role === 'user';
    const isAdmin = role === 'admin';

    if (!isAdmin && isCustomer && statusWeights[subOrder.status] >= statusWeights["shipped"]) {
      return res.status(400).json({ success: false, message: "Order already shipped, cannot cancel. Please refuse delivery at doorstep." });
    }

    if (subOrder.status === "cancelled") return res.status(400).json({ success: false, message: "Already cancelled" });

    const prevStatus = subOrder.status;
    subOrder.status = "cancelled";
    subOrder.cancelledAt = new Date();
    subOrder.statusHistory.push({ from: prevStatus, to: "cancelled", reason: reason || "User request", changed_by: `${role}:${userId}` });

    // 1. RESTORE STOCK
    for (const item of subOrder.items) {
      await Product.updateOne(
        { _id: item.product, "variants.color": item.color, "variants.sizes.size": item.size },
        { $inc: { "variants.$[v].sizes.$[s].stock": item.quantity } },
        { arrayFilters: [{ "v.color": item.color }, { "s.size": item.size }] }
      );
    }

    // 2. RAZORPAY REFUND / REVERSAL
    if (masterOrder.razorpayPaymentId) {
      try {
        // If payout was already released, we must reverse it first
        if (subOrder.payoutStatus === "released" && subOrder.razorpayTransferId) {
           await razorpay.transfers.reverse(subOrder.razorpayTransferId, {
             amount: Math.round(subOrder.sellerPayout * 100)
           });
        }

        // Trigger Refund to Customer (Sub-order total + Tax + Shipping - Proportionate discount)
        const refundAmountPaise = Math.round(subOrder.customerPaid * 100);
        if (refundAmountPaise > 0) {
          await razorpay.payments.refund(masterOrder.razorpayPaymentId, {
            amount: refundAmountPaise,
            notes: {
              reason: reason || "Order Cancelled",
              sub_order_id: subOrder.subOrderId
            }
          });
        }
      } catch (rzpErr) {
        console.error(`❌ Razorpay Refund Error:`, rzpErr.message);
      }
    }

    await subOrder.save();
    
    // 3. RELEASE COUPON if applicable
    if (masterOrder.coupon) {
      const activeSubs = await SubOrder.countDocuments({ masterOrder: masterOrder._id, status: { $ne: 'cancelled' } });
      if (activeSubs === 0 || masterOrder.paymentMethod === "COD") {
        await CouponService.releaseCoupon(masterOrder._id);
      }
    }

    // Update Master Order Status
    masterOrder.status = await masterOrder.computeStatus();
    await masterOrder.save();

    // NOTIFICATIONS
    sendNotification({
        userId: masterOrder.user,
        role: 'buyer',
        type: 'ORDER_CANCELLED',
        message: `Your order part ${subOrder.subOrderId} has been cancelled.`,
        orderId: masterOrder._id
    });

    sendNotification({
        userId: subOrder.seller,
        role: 'seller',
        type: 'ORDER_CANCELLED',
        message: `Order part ${subOrder.subOrderId} was cancelled by the user.`,
        orderId: masterOrder._id
    });

    notifyAdmins({
        type: 'ORDER_CANCELLED',
        message: `Sub-order ${subOrder.subOrderId} has been cancelled by ${role}.`,
        orderId: masterOrder._id
    });

    res.status(200).json({ success: true, message: "Order cancelled successfully", subOrder });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestReturn = async (req, res) => {
  const { subOrderId, reason } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    let subOrder = await SubOrder.findOne({ subOrderId: subOrderId });
    if (!subOrder && mongoose.Types.ObjectId.isValid(subOrderId)) {
      subOrder = await SubOrder.findById(subOrderId);
    }

    if (!subOrder) return res.status(404).json({ success: false, message: "Sub-order not found" });

    const masterOrder = await MasterOrder.findById(subOrder.masterOrder);
    if (role === 'buyer' && masterOrder.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (subOrder.status !== "delivered") {
      return res.status(400).json({ success: false, message: "Only delivered items can be returned" });
    }

    const prevStatus = subOrder.status;
    subOrder.status = "return_requested";
    subOrder.statusHistory.push({ 
      from: prevStatus, 
      to: "return_requested", 
      reason: reason || "User return request", 
      changed_by: `${role}:${userId}` 
    });

    await subOrder.save();

    masterOrder.status = await masterOrder.computeStatus();
    await masterOrder.save();

    // NOTIFICATIONS
    sendNotification({
        userId: subOrder.seller,
        role: 'seller',
        type: 'RETURN_REQUESTED',
        message: `Return requested for sub-order ${subOrder.subOrderId}. Reason: ${reason}`,
        orderId: masterOrder._id
    });

    notifyAdmins({
        type: 'RETURN_REQUESTED',
        message: `User requested return for ${subOrder.subOrderId}`,
        orderId: masterOrder._id
    });

    res.status(200).json({ success: true, message: "Return request submitted successfully", subOrder });
  } catch (error) {
    console.error("Return Request Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelSubOrder = async (req, res) => {
  const { subOrderId } = req.params;
  const { reason } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder) return res.status(404).json({ success: false, message: "Sub-order not found" });

    const statusWeights = {
      "placed": 1,
      "confirmed": 2,
      "processing": 3,
      "shipped": 4,
      "out_for_delivery": 5,
      "delivered": 6
    };

    const isCustomer = role === 'user';
    const isAdmin = role === 'admin';

    if (!isAdmin && isCustomer && statusWeights[subOrder.status] >= statusWeights["shipped"]) {
      return res.status(400).json({ success: false, message: "Order already shipped, cannot cancel. Please refuse delivery at doorstep." });
    }

    if (subOrder.status === "cancelled") return res.status(400).json({ success: false, message: "Already cancelled" });

    const prevStatus = subOrder.status;
    subOrder.status = "cancelled";
    subOrder.cancelledAt = new Date();
    subOrder.statusHistory.push({ from: prevStatus, to: "cancelled", reason: reason || "User request", changed_by: `${role}:${userId}` });

    // 1. RESTORE STOCK
    for (const item of subOrder.items) {
      await Product.updateOne(
        { _id: item.product, "variants.color": item.color, "variants.sizes.size": item.size },
        { $inc: { "variants.$[v].sizes.$[s].stock": item.quantity } },
        { arrayFilters: [{ "v.color": item.color }, { "s.size": item.size }] }
      );
    }

    // 2. RAZORPAY REFUND / REVERSAL
    const masterOrder = await MasterOrder.findById(subOrder.masterOrder);
    if (masterOrder.razorpayPaymentId) {
      try {
        // If payout was already released, we must reverse it first
        if (subOrder.payoutStatus === "released" && subOrder.razorpayTransferId) {
           await razorpay.transfers.reverse(subOrder.razorpayTransferId, {
             amount: Math.round(subOrder.sellerPayout * 100)
           });
           console.log(`🔄 Reversed Transfer for ${subOrder.subOrderId}`);
        }

        // Trigger Refund to Customer
        const refundAmountPaise = Math.round((subOrder.subTotal + subOrder.shippingCost + subOrder.taxAmount) * 100);
        const refund = await razorpay.payments.refund(masterOrder.razorpayPaymentId, {
          amount: refundAmountPaise,
          notes: {
            reason: reason || "Order Cancelled",
            sub_order_id: subOrder.subOrderId
          }
        });
        
        console.log(`💰 Refund Initiated: ${refund.id} for ${subOrder.subOrderId}`);
      } catch (rzpErr) {
        console.error(`❌ Razorpay Refund Error:`, rzpErr.message);
      }
    }

    await subOrder.save();
    
    // 3. RELEASE COUPON if applicable
    if (masterOrder.coupon) {
      // Rule: For COD cancellations before delivery, coupon is released.
      // Rule: If it's the last sub-order being cancelled, release coupon.
      const activeSubs = await SubOrder.countDocuments({ masterOrder: masterOrder._id, status: { $ne: 'cancelled' } });
      if (activeSubs === 0 || masterOrder.paymentMethod === "COD") {
        await CouponService.releaseCoupon(masterOrder._id);
      }
    }

    // Update Master Order Status
    masterOrder.status = await masterOrder.computeStatus();
    await masterOrder.save();


    // NOTIFICATIONS
    sendNotification({
        userId: masterOrder.user,
        role: 'buyer',
        type: 'ORDER_CANCELLED',
        message: `Order part ${subOrder.subOrderId} has been cancelled.`,
        orderId: masterOrder._id
    });

    sendNotification({
        userId: subOrder.seller,
        role: 'seller',
        type: 'ORDER_CANCELLED',
        message: `Order part ${subOrder.subOrderId} was cancelled by the user.`,
        orderId: masterOrder._id
    });

    // 📩 Notification for Admin
    notifyAdmins({
        type: 'ORDER_CANCELLED',
        message: `Sub-order ${subOrder.subOrderId} has been cancelled.`,
        orderId: masterOrder._id
    });

    res.status(200).json({ success: true, message: "Sub-order cancelled and refund initiated", subOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSubOrderStatus = async (req, res) => {
  const { subOrderId } = req.params;
  let { status, trackingId, trackingNumber, trackingUrl, reason } = req.body;
  if (status) status = status.toLowerCase();
  if (status === "ready_to_ship") status = "packed";
  if (status === "packed") status = "processing"; 
  if (status === "shipped") status = "shipped";
  const sellerId = req.user.userId;

  try {
    const subOrder = await SubOrder.findOne({ _id: subOrderId, seller: sellerId });
    if (!subOrder) return res.status(404).json({ success: false, message: "Sub-order not found" });

    const prevStatus = subOrder.status;

    // 1. STRICT STATE MACHINE VALIDATION
    const transitions = {
      "placed": ["confirmed", "cancelled"],
      "confirmed": ["processing", "cancelled"],
      "processing": ["shipped", "cancelled"],
      "shipped": ["out_for_delivery"],
      "out_for_delivery": ["delivered"],
      "delivered": ["return_requested"],
      "return_requested": ["returned"],
      "returned": ["refunded"]
    };

    const statusWeights = {
      "cancelled": -1,
      "placed": 1,
      "confirmed": 2,
      "processing": 3,
      "shipped": 4,
      "out_for_delivery": 5,
      "delivered": 6,
      "return_requested": 7,
      "returned": 8,
      "refunded": 9
    };

    if (statusWeights[status] <= statusWeights[prevStatus] && status !== "cancelled") {
       return res.status(400).json({ success: false, message: `Status rollback is not allowed. Cannot move from ${prevStatus} to ${status}.` });
    }

    if (!transitions[prevStatus] || !transitions[prevStatus].includes(status)) {
       return res.status(400).json({ success: false, message: `Invalid transition from ${prevStatus} to ${status}` });
    }

    if (status !== prevStatus) {
       subOrder.status = status;
       subOrder.statusHistory.push({ from: prevStatus, to: status, reason: reason || "Manual update", changed_by: `seller:${sellerId}` });
    }

    const masterOrder = await MasterOrder.findById(subOrder.masterOrder);

    if (status === "shipped") {
       subOrder.trackingId = trackingNumber || trackingId;
       subOrder.trackingUrl = trackingUrl;
    } else if (status === "delivered") {
       subOrder.deliveredAt = new Date();
       subOrder.payoutStatus = "released";
       subOrder.payoutReleasedAt = new Date();
       
       // 1. Release Payout to Internal Wallet (Dashboard/Fallback)
       const sellerUser = await User.findById(sellerId);
       sellerUser.walletBalance = (sellerUser.walletBalance || 0) + subOrder.sellerPayout;
       await sellerUser.save();
       await WalletTransaction.create({ 
         user: sellerId, 
         amount: subOrder.sellerPayout, 
         type: "credit", 
         source: "seller_payout", 
         description: `Payout for ${subOrder.subOrderId}` 
       });

       // 2. RELEASE RAZORPAY ROUTE TRANSFER (If Online Payment & Held)
       if (subOrder.razorpayTransferId) {
         try {
           // Release the hold (PATCH)
           await razorpay.transfers.edit(subOrder.razorpayTransferId, {
             on_hold: 0 // Release immediately
           });
           
           console.log(`✅ Razorpay Transfer Released: ${subOrder.razorpayTransferId} for ${subOrder.subOrderId}`);
         } catch (rzpErr) {
           console.error(`❌ Razorpay Transfer Release Failed for ${subOrder.subOrderId}:`, rzpErr.message);
         }
       } else if (masterOrder.razorpayPaymentId) {
         // Fallback: If for some reason transfer wasn't created at payment, create it now (un-held)
         try {
           const sellerProfile = await SellerProfile.findOne({ user: sellerId });
           if (sellerProfile && sellerProfile.razorpayAccountId) {
             const transferAmountPaise = Math.round(subOrder.sellerPayout * 100);
             const transfer = await razorpay.payments.transfer(masterOrder.razorpayPaymentId, {
               transfers: [
                 {
                   account: sellerProfile.razorpayAccountId,
                   amount: transferAmountPaise,
                   currency: "INR",
                   notes: {
                     sub_order_id: subOrder.subOrderId,
                     master_order_id: masterOrder.orderId
                   },
                   on_hold: 0 // Direct release
                 }
               ]
             });
             subOrder.razorpayTransferId = transfer.items[0].id;
             console.log(`✅ Razorpay Transfer Created & Released (Fallback): ${subOrder.razorpayTransferId}`);
           }
         } catch (fallbackErr) {
            console.error(`❌ Fallback Transfer Failed:`, fallbackErr.message);
         }
       }
    } else if (status === "cancelled") {
       subOrder.cancelledAt = new Date();
       // Trigger refund logic (simplified for now)
    }

    await subOrder.save();

    const masterOrderForCompute = await MasterOrder.findById(subOrder.masterOrder);
    masterOrderForCompute.status = await masterOrderForCompute.computeStatus();
    
    // --- Gamification Hooks ---
    try {
      const { onDeliveryConfirmed, onOrderReturned } = require("../Services/GamificationService");
      if (masterOrderForCompute.status === "delivered") {
        await onDeliveryConfirmed(masterOrderForCompute._id);
        
        // --- Ranking Hook: Increment salesCount ---
        const { onDeliveryConfirmed: rankSales } = require("../Services/RankingService");
        for (const subOrderId of masterOrderForCompute.subOrders) {
          const SubOrder = require("../Models/SubOrder.Model");
          const sub = await SubOrder.findById(subOrderId);
          if (sub) {
            for (const item of sub.items) {
              await rankSales(item.product);
            }
          }
        }

        // --- Referral Hook: Credit referrer if this is the first order ---
        await ReferralService.processFirstOrderReward(masterOrderForCompute.user, masterOrderForCompute._id);
      } else if (masterOrderForCompute.status === "returned") {
        await onOrderReturned(masterOrderForCompute._id);
      }

      // --- Coupon Hook: Release coupon if entire order is returned or cancelled ---
      if (masterOrderForCompute.coupon && (masterOrderForCompute.status === "returned" || masterOrderForCompute.status === "cancelled")) {
        const CouponService = require("../Services/Coupon.Service");
        await CouponService.releaseCoupon(masterOrderForCompute._id);
      }
    } catch (gamiError) {
      console.error("Gamification Hook Error:", gamiError);
    }
    // ---------------------------
    
    await masterOrderForCompute.save();

    const msgs = { 
        processing: "Seller started preparing your items.", 
        packed: "Items are packed.", 
        shipped: `Items shipped! Track: ${subOrder.trackingId}`, 
        delivered: "Delivered!" 
    };
    
    if (msgs[status]) {
      sendNotification({
          userId: masterOrder.user,
          role: 'buyer',
          type: 'ORDER_UPDATE',
          message: msgs[status],
          orderId: masterOrder._id
      });

      // 📩 Notification for Admin
      notifyAdmins({
          type: 'ORDER_UPDATE',
          message: `Order ${subOrder.subOrderId} status updated to ${status}.`,
          orderId: masterOrder._id
      });
    }

    res.status(200).json({ success: true, message: "Status updated", subOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
  const userId = req.user.userId;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

  if (expectedSignature !== razorpay_signature) return res.status(400).json({ success: false, message: "Verification failed" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userDoc = await User.findById(userId);
    const selectedAddress = userDoc.addresses.id(orderData.addressId);
    const zipCode = selectedAddress.zipCode || selectedAddress.zipcode;
    const subOrdersData = await prepareOrderSplitting(orderData.items, zipCode);

    const subTotal = subOrdersData.reduce((sum, s) => sum + s.subTotal, 0);
    const shipping = subOrdersData.reduce((sum, s) => sum + s.shippingCost, 0);
    const tax = subOrdersData.reduce((sum, s) => sum + s.taxAmount, 0);
    const codFee = 0; // Online payment, no COD fee

    let couponDiscount = 0;
    let couponId = null;
    let finalShipping = shipping;

    if (orderData.couponCode) {
        // We validate again to get the correct couponId and discount
        const validation = await CouponService.validateCoupon(orderData.couponCode, userId, orderData.items, subTotal, "Razorpay");
        couponDiscount = validation.discount;
        couponId = validation.coupon._id;

        if (validation.coupon.couponType === 'free_shipping') {
            finalShipping = 0;
            couponDiscount = shipping;
        }
    }

    const totalAmount = Math.round(subTotal + tax + finalShipping - couponDiscount);

    const masterData = {
      user: userId, 
      totalAmount, 
      codFee: 0, 
      address: { 
          fullName: selectedAddress.fullName, 
          phone: selectedAddress.phone, 
          street: selectedAddress.street, 
          city: selectedAddress.city, 
          state: selectedAddress.state, 
          zipCode, 
          country: selectedAddress.country || "India" 
      },
      paymentMethod: orderData.walletUsed > 0 ? "Partial" : "Razorpay", 
      paymentStatus: "paid", 
      razorpayOrderId: razorpay_order_id, 
      razorpayPaymentId: razorpay_payment_id, 
      razorpaySignature: razorpay_signature,
      coupon: couponId,
      couponCode: orderData.couponCode,
      couponDiscount: couponDiscount
    };

    const masterOrder = await createFinalOrders(session, masterData, subOrdersData);
    
    // Mark coupon as used since payment is verified
    if (couponId) {
        await CouponService.markAsUsed(masterOrder._id);
    }

    // --- Referral Hook: Credit referrer if this is the first order ---
    await ReferralService.processFirstOrderReward(userId, masterOrder._id);

    await session.commitTransaction();
    // --- Social Shopping Hook: Mark shared carts as purchased ---
    try {
      const { markCartAsPurchased } = require("../Services/SharedCartService");
      await markCartAsPurchased(userId);
    } catch (shareErr) {
      console.error("Shared cart update failed:", shareErr);
    }

    res.status(201).json({ success: true, order: masterOrder });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await MasterOrder.find({ user: req.user.userId }).populate(customerOrderPopulate).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await SubOrder.find({ seller: req.user.userId }).populate({ path: "masterOrder", populate: { path: "user", select: "name email phone" } }).populate("items.product", "name variants").sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSellerSubOrderById = async (req, res) => {
  try {
    const order = await SubOrder.findOne({ _id: req.params.orderId, seller: req.user.userId }).populate({ path: "masterOrder", populate: { path: "user", select: "name email phone" } }).populate("items.product", "name image variants color sizes");
    if (!order) return res.status(404).json({ success: false, message: "Sub-order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMasterOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    let query = { user: req.user.userId };
    if (mongoose.Types.ObjectId.isValid(orderId)) query._id = orderId;
    else query.orderId = orderId;
    const order = await MasterOrder.findOne(query).populate(customerOrderPopulate);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Order Identifier is required" });

    let masterOrder;

    // 1. Try finding by Master Order ID (ORD-1001)
    masterOrder = await MasterOrder.findOne({ orderId: id.toUpperCase() })
      .populate(customerOrderPopulate);

    // 2. If not found, try finding by Sub-Order ID (ORD-1001-A)
    if (!masterOrder) {
      const subOrder = await SubOrder.findOne({ subOrderId: id.toUpperCase() });
      if (subOrder) {
        masterOrder = await MasterOrder.findById(subOrder.masterOrder)
          .populate(customerOrderPopulate);
      }
    }

    // 3. Last fallback: Try Mongo ID
    if (!masterOrder && mongoose.Types.ObjectId.isValid(id)) {
      masterOrder = await MasterOrder.findById(id).populate(customerOrderPopulate);
    }

    if (!masterOrder) {
      return res.status(404).json({ success: false, message: "No tracking data found for this identifier." });
    }

    res.status(200).json({ success: true, order: masterOrder });
  } catch (error) {
    console.error("Track Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await MasterOrder.find()
      .populate({
        path: "user",
        select: "name email phone",
      })
      .populate(customerOrderPopulate)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminDashboardStats = async (req, res) => {
  try {
    const totalOrders = await MasterOrder.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalProducts = await Product.countDocuments();

    const revenueData = await MasterOrder.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const commissionData = await SubOrder.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$platformCommission" },
        },
      },
    ]);

    // Sales over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesTrend = await MasterOrder.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order status distribution
    const statusDistribution = await MasterOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Payout Summary
    const payoutStats = await SubOrder.aggregate([
      {
        $group: {
          _id: null,
          totalHeld: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$status", "delivered"] }, { $ne: ["$payoutStatus", "released"] }, { $ne: ["$status", "cancelled"] }] },
                "$sellerPayout",
                0
              ]
            }
          },
          totalReleased: {
            $sum: {
              $cond: [{ $eq: ["$payoutStatus", "released"] }, "$sellerPayout", 0]
            }
          },
          pendingRefunds: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$status", "cancelled"] }, { $ne: ["$paymentStatus", "refunded"] }] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalSellers,
        totalProducts,
        totalSales: revenueData[0]?.totalSales || 0,
        totalCommission: commissionData[0]?.totalCommission || 0,
        totalHeld: payoutStats[0]?.totalHeld || 0,
        totalReleased: payoutStats[0]?.totalReleased || 0,
        pendingRefunds: payoutStats[0]?.pendingRefunds || 0,
        salesTrend,
        statusDistribution: statusDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("⚠️ Webhook signature verification failed");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const { event, payload } = req.body;
    console.log(`🔔 Webhook Event Received: ${event}`);

    // Handle payment.captured event
    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const rzpOrderId = payment.order_id;
      const rzpPaymentId = payment.id;

      // Check if order already processed
      const existingOrder = await MasterOrder.findOne({ razorpayPaymentId: rzpPaymentId });
      if (existingOrder) {
        console.log(`ℹ️ Webhook: Order ${rzpPaymentId} already processed.`);
        return res.status(200).json({ success: true, message: "Handled" });
      }

      // NOTE: In a real flow, you'd fetch the user and address from notes or temp session
      // For this implementation, we rely on the frontend verifyPayment as primary,
      // and webhook handles edge cases where verifyPayment didn't run.
      console.log(`✅ Payment Captured for Order: ${rzpOrderId}`);
    }

    if (event === "payment.failed") {
      console.log(`❌ Payment Failed: ${payload.payment.entity.id}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.status(500).json({ success: false });
  }
};

const getAdminPayoutStats = async (req, res) => {
  try {
    const subOrders = await SubOrder.find()
      .populate({ path: "seller", select: "shopName" })
      .populate({ path: "masterOrder", select: "orderId razorpayPaymentId razorpayOrderId" })
      .sort({ createdAt: -1 });

    const sellers = await SellerProfile.find().populate("user", "shopName email");

    const stats = {
      totalHeld: subOrders.filter(s => s.status !== 'delivered' && s.payoutStatus !== 'released').reduce((sum, s) => sum + (s.sellerPayout || 0), 0),
      totalReleased: subOrders.filter(s => s.payoutStatus === 'released').reduce((sum, s) => sum + (s.sellerPayout || 0), 0),
      subOrders,
      sellers
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminWalletStats = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const user = await User.findById(adminId);
    const transactions = await WalletTransaction.find({ user: adminId }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      balance: user.walletBalance || 0,
      transactions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const applyRewardCoupon = async (req, res) => {
    try {
        const { orderId, couponType } = req.body;
        const userId = req.user.userId;

        const { applyRewardCoupon: serviceApply } = require("../Services/GamificationService");
        const order = await serviceApply(orderId, userId, couponType);

        res.status(200).json({
            success: true,
            message: `₹${couponType === '25' ? '25' : '50'} discount applied using reward points.`,
            order
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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
  cancelSubOrder,
  trackOrder,
  getAllOrders,
  getAdminDashboardStats,
  getAdminPayoutStats,
  getAdminWalletStats,
  razorpayWebhook,
  applyRewardCoupon,
  cancelOrder,
  requestReturn
};
