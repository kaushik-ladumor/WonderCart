const Order = require("../Models/Order.Model");
const Payment = require("../Models/Payment.Model");
const Product = require("../Models/Product.Model");
const Cart = require("../Models/Cart.Model");
const User = require("../Models/User.Model");
const mongoose = require("mongoose");
// const { sendOrderConfirmation } = require('../Middlewares/email');

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Notification = require("../Models/Notification.Model");
const Coupon = require("../Models/Coupon.Model");
const WalletTransaction = require("../Models/WalletTransaction.Model");

const checkLoyalUserCoupons = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const completedOrdersCount = await Order.countDocuments({
      user: userId,
      status: "delivered"
    });

    const loyalCoupons = await Coupon.find({
      targetType: "loyal_users",
      targetRole: user.role,
      minCompletedOrders: { $lte: completedOrdersCount },
      allowedUsers: { $ne: userId }
    });

    for (const coupon of loyalCoupons) {
      coupon.allowedUsers.push(userId);
      await coupon.save();
    }
  } catch (error) {
    console.error("Error checking loyal user coupons:", error);
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "name price variants",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      items,
      productId,
      quantity,
      color,
      size,
      totalAmount,
      addressId,
      paymentMethod,
      couponCode,
      walletUsed // Extract walletUsed
    } = req.body;

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
    // FIX: Check which environment variable names are being used
    // COD OR RAZORPAY HANDLING
    // ---------------------------------------------------------
    // 1. SHARED CALCULATION (Items, Stock, Coupons)
    // ---------------------------------------------------------
    let subTotal = 0;
    let orderItemsData = [];

    if (productId && quantity) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const variant = product.variants.find(v => v.color === color);
      if (!variant) return res.status(400).json({ success: false, message: "Color not available" });

      const sizeObj = variant.sizes.find(s => s.size === size);
      if (!sizeObj) return res.status(400).json({ success: false, message: "Size not available" });

      if (sizeObj.stock < quantity) {
        return res.status(400).json({ success: false, message: `Only ${sizeObj.stock} available` });
      }
      subTotal = sizeObj.sellingPrice * quantity;
      orderItemsData.push({ category: product.category, price: sizeObj.sellingPrice, quantity });

    } else if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(404).json({ success: false, message: `Product not found` });

        const variant = product.variants.find(v => v.color === item.color);
        if (!variant) return res.status(400).json({ success: false, message: `Color not available` });

        const sizeObj = variant.sizes.find(s => s.size === item.size);
        if (!sizeObj) return res.status(400).json({ success: false, message: `Size not available` });

        if (sizeObj.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Stock insufficient for ${product.name}` });
        }
        subTotal += sizeObj.sellingPrice * item.quantity;
        orderItemsData.push({ category: product.category, price: sizeObj.sellingPrice, quantity: item.quantity });
      }
    } else {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    // COUPON VALIDATION
    let couponDiscount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: "active" });
      if (coupon) {
        const pastOrders = await Order.countDocuments({ user: userId, status: { $ne: "cancelled" } });
        const isExplicitlyAllowed = coupon.allowedUsers.some(id => id.toString() === userId.toString());

        let isEligible = isExplicitlyAllowed || coupon.targetType === "all";
        if (!isEligible && coupon.targetType === "new_users") {
          isEligible = pastOrders === 0;
        }

        if (!isEligible) {
          return res.status(400).json({ success: false, message: "You are not eligible for this coupon" });
        }

        const usageCount = await Order.countDocuments({
          user: userId,
          coupon: coupon._id,
          status: { $ne: "cancelled" }
        });
        if (usageCount >= (coupon.perUserLimit || 1)) {
          return res.status(400).json({ success: false, message: "Usage limit exceeded for this coupon" });
        }

        if (coupon.minOrderValue > 0 && subTotal < coupon.minOrderValue) {
          return res.status(400).json({ success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required.` });
        }

        if (coupon.isFirstOrderOnly && pastOrders > 0) {
          return res.status(400).json({ success: false, message: "This coupon is only valid for your first order." });
        }

        let applicableSubTotal = subTotal;
        if (coupon.targetCategory) {
          const targetCat = coupon.targetCategory.toLowerCase().trim();
          const categoryItems = orderItemsData.filter(item => item.category?.toLowerCase().trim() === targetCat);
          if (categoryItems.length === 0) {
            return res.status(400).json({ success: false, message: `This coupon is exclusively for ${coupon.targetCategory} items.` });
          }
          applicableSubTotal = categoryItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        }

        const tempTax = Math.round(subTotal * 0.18);
        const tempShipping = subTotal < 999 ? 50 : 0;
        let baseForDiscount = applicableSubTotal + Math.round(applicableSubTotal * 0.18);

        if (!coupon.targetCategory) {
          baseForDiscount += tempShipping;
        }

        if (coupon.dealType === 'percentage') {
          couponDiscount = Math.round((baseForDiscount * coupon.discount) / 100);
          if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
            couponDiscount = coupon.maxDiscount;
          }
        } else if (coupon.dealType === 'fixed') {
          couponDiscount = Math.round(Math.min(coupon.discount, baseForDiscount));
        } else if (coupon.dealType === 'free_shipping') {
          couponDiscount = tempShipping;
        }
        couponId = coupon._id;
      } else {
        return res.status(400).json({ success: false, message: "Invalid or inactive coupon" });
      }
    }

    const tax = Math.round(subTotal * 0.18);
    const shipping = subTotal < 999 ? 50 : 0;
    const finalTotalAmount = Math.round(Math.max(0, (subTotal + tax + shipping) - couponDiscount));
    const payableTotal = Math.max(0, finalTotalAmount - (walletUsed || 0));

    // ---------------------------------------------------------
    // 2. PAYMENT METHOD HANDLING
    // ---------------------------------------------------------
    if (paymentMethod === "Razorpay") {


      if (payableTotal === 0) {
        // Fully paid by wallet or free order
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const selectedAddress = user.addresses.id(addressId);
        if (!selectedAddress) return res.status(400).json({ success: false, message: "Address not found" });

        return handleOrderCreation(req, res, {
          userId, selectedAddress, totalAmount: finalTotalAmount, items, productId, quantity, color, size, paymentMethod: "Razorpay",
          couponCode,
          walletUsed: walletUsed || 0,
          paymentDetails: {
            razorpayPaymentId: "wallet_order_" + Date.now(),
            razorpayOrderId: "wallet_order_" + Date.now(),
            razorpaySignature: "wallet_order_" + Date.now()
          },
          email: req.user.email
        });
      }

      // 2. Create Razorpay Order
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ success: false, message: "Payment gateway config missing" });
      }

      const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });

      const razorpayOrder = await instance.orders.create({
        amount: Math.round(payableTotal * 100), // Use totalAmount minus wallet
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      // 3. Return ID (No DB Order created yet)
      return res.status(200).json({
        success: true,
        message: "Razorpay order created",
        razorpayOrder,
        // No order created yet
      });

    } else {
      // ---------------------------------------------------------
      // COD: Full Process (Deduct Stock -> Create Order -> Clear Cart)
      // ---------------------------------------------------------
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const selectedAddress = user.addresses.id(addressId);
      if (!selectedAddress) return res.status(400).json({ success: false, message: "Address not found" });

      return handleOrderCreation(req, res, {
        userId, selectedAddress, totalAmount: finalTotalAmount, items, productId, quantity, color, size, paymentMethod: "COD",
        couponCode,
        walletUsed: walletUsed || 0,
        email: req.user.email // Pass email from token as fallback
      });
    }

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate order",
      error: error.message,
    });
  }
};

// Helper for COD & Razorpay Success - REFACTORED FOR MULTITENANCY
const handleOrderCreation = async (req, res, data) => {
  const {
    userId, selectedAddress, items,
    productId, quantity, color, size,
    paymentMethod, paymentDetails, couponCode, walletUsed
  } = data;

  try {
    const user = await User.findById(userId);
    if (walletUsed > 0) {
      if (user.walletBalance < walletUsed) {
        throw new Error("Insufficient wallet balance");
      }
      user.walletBalance -= walletUsed;
      await user.save();

      await WalletTransaction.create({
        user: userId,
        amount: walletUsed,
        type: "debit",
        source: "order",
        description: `Order payment ${Date.now()}`,
        status: "completed"
      });
    }

    // 1. DEDUCT STOCK & FETCH PRODUCT DATA
    let flatItems = [];
    if (productId && quantity) {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");
      const variant = product.variants.find(v => v.color === color);
      const sizeObj = variant.sizes.find(s => s.size === size);
      if (sizeObj.stock < quantity) throw new Error(`Stock insufficient for ${product.name}`);

      sizeObj.stock -= quantity;
      await product.save();

      flatItems.push({
        product: productId,
        quantity,
        price: sizeObj.sellingPrice,
        name: product.name,
        color,
        size,
        category: product.category,
        vendorId: product.owner
      });
    } else if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.product} not found`);
        const variant = product.variants.find(v => v.color === item.color);
        const sizeObj = variant.sizes.find(s => s.size === item.size);
        if (sizeObj.stock < item.quantity) throw new Error(`Stock insufficient for ${product.name}`);

        sizeObj.stock -= item.quantity;
        await product.save();

        flatItems.push({
          product: item.product,
          quantity: item.quantity,
          price: sizeObj.sellingPrice,
          name: item.name || product.name,
          color: item.color,
          size: item.size,
          category: product.category,
          vendorId: product.owner
        });
      }
    }

    if (flatItems.length === 0) throw new Error("No valid items in order");

    // 2. GROUP BY VENDOR AND CREATE SUB-ORDERS
    const vendorGroups = {};
    flatItems.forEach(item => {
      const vid = item.vendorId.toString();
      if (!vendorGroups[vid]) vendorGroups[vid] = [];
      vendorGroups[vid].push(item);
    });

    const masterId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    let subOrders = [];
    let combinedTotal = 0;

    // Commission rate - default 10%
    const COMM_RATE = 0.10;

    Object.keys(vendorGroups).forEach((vid, index) => {
      const vendorItems = vendorGroups[vid];
      const subTotal = vendorItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
      const tax = Math.round(subTotal * 0.18);
      const shipping = subTotal < 999 ? 50 : 0;
      const commission = Math.round(subTotal * COMM_RATE);
      const payout = subTotal - commission;

      const subOrderSuffix = String.fromCharCode(65 + index); // A, B, C...

      subOrders.push({
        subOrderId: `${masterId}-${subOrderSuffix}`,
        vendor: vid,
        items: vendorItems.map(vi => ({
          product: vi.product,
          name: vi.name,
          quantity: vi.quantity,
          price: vi.price,
          color: vi.color,
          size: vi.size,
          category: vi.category
        })),
        status: "pending",
        subTotal,
        taxAmount: tax,
        shippingAmount: shipping,
        commissionAmount: commission,
        vendorPayoutAmount: payout,
        statusHistory: [{ from: "", to: "pending", reason: "Order created", timestamp: new Date() }]
      });

      combinedTotal += (subTotal + tax + shipping);
    });

    // Handle coupon on the combined total
    let finalDiscount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: "active" });
      if (coupon) {
        // ... (simplified logic for now to keep focus on sub-orders)
        finalDiscount = 0; // In a real app, distribute discount across sub-orders proportional to sub-totals
        couponId = coupon._id;
      }
    }

    const finalOrderTotal = combinedTotal - finalDiscount;

    // 3. CREATE MASTER ORDER
    const order = new Order({
      masterOrderId: masterId,
      user: userId,
      subOrders: subOrders,
      totalAmount: finalOrderTotal,
      paymentMethod,
      address: {
        fullName: selectedAddress?.fullName,
        phone: selectedAddress?.phone,
        street: selectedAddress?.street,
        city: selectedAddress?.city,
        state: selectedAddress?.state,
        country: selectedAddress?.country || "India",
        zipcode: selectedAddress?.zipCode || selectedAddress?.zipcode,
      },
      razorpayOrderId: paymentDetails?.razorpayOrderId,
      razorpayPaymentId: paymentDetails?.razorpayPaymentId,
      razorpaySignature: paymentDetails?.razorpaySignature,
      paymentGatewayRef: paymentDetails?.razorpayPaymentId || "COD",
      coupon: couponId,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      couponDiscount: finalDiscount,
    });

    // If Razorpay, advance state
    if (paymentMethod === "Razorpay") {
      order.paymentStatus = "paid";
      order.subOrders.forEach(so => {
        so.status = "confirmed";
        so.statusHistory.push({ from: "pending", to: "confirmed", reason: "Payment received", timestamp: new Date() });
      });
    }

    order.status = order.computeStatus();
    await order.save();

    // 4. CREATE PAYMENT RECORD
    await Payment.create({
      orderId: order._id,
      user: userId,
      paymentMethod,
      paymentStatus: paymentMethod === "Razorpay" ? "completed" : "pending",
      transactionId: paymentDetails?.razorpayPaymentId || `COD-${Date.now()}`,
      amount: finalOrderTotal,
    });

    // 5. CLEAR CART
    const isBuyNow = productId && quantity && (!items || items.length === 0);
    if (!isBuyNow) {
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    }

    // 6. NOTIFY SELLERS
    for (const sub of order.subOrders) {
      const sellerId = sub.vendor;
      const msg = paymentMethod === "Razorpay"
        ? `Your sub-order ${sub.subOrderId} is CONFIRMED. Payment ₹${sub.subTotal} received.`
        : `New sub-order ${sub.subOrderId} received (COD). Please confirm.`;

      await Notification.create({
        user: sellerId,
        role: "seller",
        type: paymentMethod === "Razorpay" ? "new-order-paid" : "new-order",
        message: msg,
        orderId: order._id,
      });

      if (global.io) {
        global.io.to(`seller-${sellerId}`).emit("notification", {
          type: "sub-order-update",
          message: msg,
          orderId: order._id,
          subOrderId: sub.subOrderId
        });
      }
    }

    if (global.io) global.io.emit("seller-dashboard-update");

    return res.status(201).json({
      success: true,
      message: "Order grouped and split successfully",
      order,
    });

  } catch (err) {
    console.error("Order Split Processing Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderData // Contains items, addressId, etc.
    } = req.body;

    const userId = req.user.userId;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // 2. Fetch User & Address
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const selectedAddress = user.addresses.id(orderData.addressId);
    if (!selectedAddress) return res.status(400).json({ success: false, message: "Address not found" });

    // 3. CALL HANDLER to create order (Deduct stock, clear cart, etc.)
    return handleOrderCreation(req, res, {
      userId,
      selectedAddress,
      totalAmount: orderData.totalAmount || orderData.amount, // Ensure correct field
      items: orderData.items,
      productId: orderData.productId, // If single item
      quantity: orderData.quantity,
      color: orderData.color,
      size: orderData.size,
      paymentMethod: "Razorpay",
      walletUsed: orderData.walletUsed || 0, // Ensure walletUsed is passed
      paymentDetails: {
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature
      },
      email: req.user.email // Pass email from token
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};


const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate({
        path: "items.product",
        select: "name price variants",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("User from token:", req.user);
    console.log("User ID:", req.user?.userId || req.user?.id || req.user?._id);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId).populate({
      path: "items.product",
      select: "name price variants",

    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("Order user ID:", order.user);
    console.log("Order user toString:", order.user?.toString());
    console.log("Order user _id:", order.user?._id);

    const userId = req.user.userId || req.user.id || req.user._id;

    const orderUserId = order.user.toString ? order.user.toString() : order.user;

    if (orderUserId !== userId.toString()) {
      console.log(`Authorization failed: ${orderUserId} !== ${userId}`);
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

const getSellerOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user.userId;

    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate({
        path: "subOrders.items.product",
        select: "name variants owner",
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Find the sub-order belonging to this seller
    const subOrder = order.subOrders.find(so => so.vendor.toString() === sellerId.toString());

    if (!subOrder) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own a sub-order in this master order."
      });
    }

    // Resolve images for items
    const enrichedItems = subOrder.items.map(item => {
      const variant = item.product?.variants?.find(v =>
        v.color.toLowerCase() === item.color?.toLowerCase()
      );
      return {
        ...item.toObject(),
        image: variant?.images?.[0] || null
      };
    });

    res.status(200).json({
      success: true,
      masterOrderId: order.masterOrderId,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      address: order.address,
      user: order.user,
      subOrder: {
        ...subOrder.toObject(),
        items: enrichedItems
      }
    });

  } catch (err) {
    console.error("Error in getSellerOrderById:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

const updateSubOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, trackingUrl, reason } = req.body;
    const sellerId = req.user.userId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const subOrder = order.subOrders.find(so => so.vendor.toString() === sellerId.toString());
    if (!subOrder) return res.status(403).json({ success: false, message: "Sub-order not found or unauthorized" });

    // 1. LIFECYCLE VALIDATION
    const validTransitions = {
      "pending": ["confirmed", "cancelled"],
      "confirmed": ["processing", "cancelled"],
      "processing": ["packed", "cancelled"],
      "packed": ["shipped"],
      "shipped": ["delivered", "returned"],
      "delivered": ["returned"]
    };

    const currentStatus = subOrder.status;
    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`
      });
    }

    // 2. UPDATE SUB-ORDER
    const prevStatus = currentStatus;
    subOrder.status = status;
    subOrder.statusHistory.push({
      from: prevStatus,
      to: status,
      timestamp: new Date(),
      changed_by: `seller:${sellerId}`,
      reason: reason || "Manual status update"
    });

    if (status === "shipped") {
      subOrder.trackingNumber = trackingNumber;
      subOrder.trackingUrl = trackingUrl;
    } else if (status === "delivered") {
      subOrder.deliveredAt = new Date();
      // Payout logic
      subOrder.payoutStatus = "released";
      subOrder.payoutReleasedAt = new Date();
    } else if (status === "cancelled") {
      subOrder.cancelledAt = new Date();
      // Refund logic would be triggered here in a real app
    }

    // 3. RECOMPUTE MASTER STATUS
    order.status = order.computeStatus();
    await order.save();

    // 4. NOTIFICATIONS
    const notificationMessages = {
      confirmed: `Your items from vendor are confirmed.`,
      processing: `A vendor has started preparing your items.`,
      packed: `Your items are packed and ready to ship.`,
      shipped: `Your items have been shipped! Tracking ID: ${trackingNumber || "N/A"}`,
      delivered: `Your items have been delivered. Thank you!`,
      cancelled: `Sorry, a vendor could not fulfill your sub-order for some items.`
    };

    const msg = notificationMessages[status] || `Your sub-order status is now ${status}`;

    // Notify Customer
    await Notification.create({
      user: order.user,
      role: "customer",
      type: "order-update",
      message: msg,
      orderId: order._id
    });

    if (global.io) {
      global.io.to(`user-${order.user}`).emit("notification", {
        type: "order-update",
        message: msg,
        orderId: order._id,
        subOrderId: subOrder.subOrderId,
        status: status
      });
    }

    res.status(200).json({
      success: true,
      message: `Sub-order status updated to ${status}`,
      subOrder
    });

  } catch (err) {
    console.error("Update Sub-Order Status Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const orders = await Order.find({ "subOrders.vendor": sellerId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const processedOrders = orders.map(order => {
      const subOrder = order.subOrders.find(so => so.vendor.toString() === sellerId.toString());
      return {
        _id: order._id,
        masterOrderId: order.masterOrderId,
        subOrder: subOrder,
        user: order.user,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      };
    });

    res.status(200).json({
      success: true,
      orders: processedOrders
    });

  } catch (err) {
    console.error("Get Seller Orders Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find(v => v.color === item.color);
        if (variant) {
          const sizeObj = variant.sizes.find(s => s.size === item.size);
          if (sizeObj) {
            sizeObj.stock += item.quantity;
            await product.save();
          }
        }
      }
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    global.io.to(orderId).emit("order-updated", {
      orderId,
      status: "cancelled"
    });

    global.io.emit("seller-dashboard-update");

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order already ${order.status}`,
      });
    }

    const transitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
    };

    if (!transitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    // 🔐 Seller ownership check
    if (req.user.role === "seller") {
      const ownsProduct = order.items.some(
        item => item.product.owner.toString() === req.user.userId.toString()
      );
      if (!ownsProduct) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    // ✅ Update status
    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = new Date();
      // Check for loyalty coupons
      await checkLoyalUserCoupons(order.user);
    }
    if (status === "cancelled") order.cancelledAt = new Date();
    await order.save();

    // 🔔 ORDER ROOM UPDATE
    global.io.to(orderId).emit("order-updated", { orderId, status });
    global.io.emit("seller-dashboard-update");

    // ===============================
    // 🔔 SELLER NOTIFICATIONS
    // ===============================
    const sellerIds = new Set();
    for (const item of order.items) {
      if (item.product?.owner) {
        sellerIds.add(item.product.owner.toString());
      }
    }

    for (const sellerId of sellerIds) {
      // DB
      await Notification.create({
        user: sellerId,
        role: "seller",
        type: "order-update",
        message: `Order ${order._id.toString()} → ${status}`,
        orderId: order._id,
      });

      // REALTIME
      global.io.to(`seller-${sellerId}`).emit("notification", {
        type: "order-update",
        message: `Order ${order._id.toString()} → ${status}`,
        orderId: order._id,
        status,
      });
    }

    // ===============================
    // 🔔 BUYER NOTIFICATION
    // ===============================
    await Notification.create({
      user: order.user,
      role: "buyer",
      type: "order-update",
      message: `📦 Your order is now ${status}`,
      orderId: order._id,
    });

    global.io.to(`buyer-${order.user.toString()}`).emit("notification", {
      type: "order-update",
      message: `📦 Your order is now ${status}`,
      orderId: order._id,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });

  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("subOrders.items.product", "name price variants")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};


const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ✅ SAFETY CHECK
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
};


module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getSellerOrderById,
  cancelOrder,
  updateOrderStatus,
  updateSubOrderStatus, // Added
  getAllOrders,
  getSellerOrders,
  verifyPayment,
  trackOrder,
  getMyOrders
};