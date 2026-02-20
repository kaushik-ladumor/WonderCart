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
  console.log("REQ.USER =", req.user);

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
      couponCode
    } = req.body;

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
    // FIX: Check which environment variable names are being used
    // COD OR RAZORPAY HANDLING
    if (paymentMethod === "Razorpay") {
      // ---------------------------------------------------------
      // RAZORPAY: Just create Razorpay Order ID & Return
      // ---------------------------------------------------------

      // 1. Validate items & stock (WITHOUT deducting)
      let subTotal = 0;
      let orderItemsData = []; // To store category and price for coupon validation

      if (productId && quantity) {
        // Buy Now (Single Item)
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
        // Cart Checkout
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
          // 1. Eligibility Check
          const isAllowed = coupon.allowedUsers.some(id => id.toString() === userId.toString());
          if (!isAllowed) {
            return res.status(400).json({ success: false, message: "You are not eligible for this coupon" });
          }

          // 2. Usage Limit Check
          const usageCount = await Order.countDocuments({
            user: userId,
            coupon: coupon._id,
            status: { $ne: "cancelled" }
          });
          if (usageCount >= (coupon.perUserLimit || 1)) {
            return res.status(400).json({ success: false, message: "Usage limit exceeded for this coupon" });
          }

          // 3. Min Order Value Check
          if (coupon.minOrderValue > 0 && subTotal < coupon.minOrderValue) {
            return res.status(400).json({ success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required.` });
          }

          // 4. First Order Only Check
          if (coupon.isFirstOrderOnly) {
            const pastOrders = await Order.countDocuments({ user: userId, status: { $ne: "cancelled" } });
            if (pastOrders > 0) {
              return res.status(400).json({ success: false, message: "This coupon is only valid for your first order." });
            }
          }

          // 5. Category Check & Applicable Subtotal
          let applicableSubTotal = subTotal;
          if (coupon.targetCategory) {
            const targetCat = coupon.targetCategory.toLowerCase().trim();
            const categoryItems = orderItemsData.filter(item => item.category?.toLowerCase().trim() === targetCat);
            if (categoryItems.length === 0) {
              return res.status(400).json({ success: false, message: `This coupon is exclusively for ${coupon.targetCategory} items.` });
            }
            applicableSubTotal = categoryItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          }

          // Calculate Base for Discount
          const tempTax = Math.round(subTotal * 0.18);
          const tempShipping = subTotal < 999 ? 50 : 0;

          // The base for discount should be (Category Subtotal + its Tax)
          // Scale tax for percentage calculation if category specific
          let baseForDiscount = applicableSubTotal + Math.round(applicableSubTotal * 0.18);

          // Only global coupons can discount the shipping charge part of the total
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

      // Final calculation
      const tax = Math.round(subTotal * 0.18);
      const shipping = subTotal < 999 ? 50 : 0;
      const finalTotalAmount = Math.round(Math.max(0, (subTotal + tax + shipping) - couponDiscount));

      // 2. Create Razorpay Order
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ success: false, message: "Payment gateway config missing" });
      }

      const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });

      const razorpayOrder = await instance.orders.create({
        amount: Math.round(finalTotalAmount * 100), // Use totalAmount with GST
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
        userId, selectedAddress, totalAmount, items, productId, quantity, color, size, paymentMethod: "COD",
        couponCode,
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

// Helper for COD & Razorpay Success
const handleOrderCreation = async (req, res, data) => {
  const {
    userId, selectedAddress, items,
    productId, quantity, color, size,
    paymentMethod, paymentDetails, couponCode
  } = data;

  try {
    const user = await User.findById(userId);
    let orderItems = [];
    let subTotal = 0; // Component total before tax

    // 1. DEDUCT STOCK & PREPARE ITEMS
    if (productId && quantity) {
      // Buy Now
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      const variant = product.variants.find(v => v.color === color);
      const sizeObj = variant.sizes.find(s => s.size === size);

      if (sizeObj.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);

      sizeObj.stock -= quantity;
      await product.save();

      const itemTotal = sizeObj.sellingPrice * quantity;
      subTotal += itemTotal;

      orderItems.push({
        product: productId,
        quantity,
        price: sizeObj.sellingPrice,
        name: product.name,
        color,
        size,
        category: product.category
      });
    } else if (items && items.length > 0) {
      // Cart
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.product} not found`);

        const variant = product.variants.find(v => v.color === item.color);
        const sizeObj = variant.sizes.find(s => s.size === item.size);

        if (sizeObj.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        sizeObj.stock -= item.quantity;
        await product.save();

        const itemTotal = sizeObj.sellingPrice * item.quantity;
        subTotal += itemTotal;

        orderItems.push({
          product: item.product,
          quantity: item.quantity,
          price: sizeObj.sellingPrice,
          name: item.name || product.name,
          color: item.color,
          size: item.size,
          category: product.category
        });
      }
    }

    if (orderItems.length === 0) throw new Error("No valid items in order");

    // COUPON VALIDATION
    let couponDiscount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: "active" });
      if (coupon) {
        // 1. Eligibility Check
        const isAllowed = coupon.allowedUsers.some(id => id.toString() === userId.toString());
        if (!isAllowed) throw new Error("You are not eligible for this coupon");

        // 2. Usage Limit Check
        const usageCount = await Order.countDocuments({
          user: userId,
          coupon: coupon._id,
          status: { $ne: "cancelled" }
        });
        if (usageCount >= (coupon.perUserLimit || 1)) throw new Error("Usage limit exceeded for this coupon");

        // 3. Min Order Value Check
        if (coupon.minOrderValue > 0 && subTotal < coupon.minOrderValue) {
          throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required.`);
        }

        // 4. First Order Only Check
        if (coupon.isFirstOrderOnly) {
          const pastOrders = await Order.countDocuments({ user: userId, status: { $ne: "cancelled" } });
          if (pastOrders > 0) throw new Error("This coupon is only valid for your first order.");
        }

        // 5. Category Check & Applicable Subtotal
        let applicableSubTotal = subTotal;
        if (coupon.targetCategory) {
          const targetCat = coupon.targetCategory.toLowerCase().trim();
          const categoryItems = orderItems.filter(item => item.category?.toLowerCase().trim() === targetCat);
          if (categoryItems.length === 0) {
            throw new Error(`This coupon is exclusively for ${coupon.targetCategory} items.`);
          }
          applicableSubTotal = categoryItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        }

        // Calculate Base for Discount
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
        throw new Error("Invalid or inactive coupon");
      }
    }

    // Add 18% GST and Shipping
    const tax = Math.round(subTotal * 0.18);
    const shipping = subTotal < 999 ? 50 : 0;
    const finalAmount = Math.round(Math.max(0, (subTotal + tax + shipping) - couponDiscount));

    // 2. CREATE ORDER
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: finalAmount, // Use secure total
      paymentMethod,
      paymentStatus: paymentMethod === "Razorpay" ? "paid" : "pending",
      status: paymentMethod === "Razorpay" ? "processing" : "pending",
      address: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country || "India",
        zipcode: selectedAddress.zipCode || selectedAddress.zipcode,
      },
      razorpayOrderId: paymentDetails?.razorpayOrderId,
      razorpayPaymentId: paymentDetails?.razorpayPaymentId,
      razorpaySignature: paymentDetails?.razorpaySignature,
      coupon: couponId,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      couponDiscount: couponDiscount
    });

    // 3. CREATE PAYMENT RECORD (If Razorpay)
    if (paymentMethod === "Razorpay" && paymentDetails) {
      await Payment.create({
        orderId: order._id,
        user: userId,
        paymentMethod: "Razorpay",
        paymentStatus: "completed",
        transactionId: paymentDetails.razorpayPaymentId,
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpaySignature: paymentDetails.razorpaySignature,
        amount: finalAmount,
      });
    } else {
      // For COD, optionally create pending payment record
      await Payment.create({
        orderId: order._id,
        user: userId,
        paymentMethod: "COD",
        paymentStatus: "pending",
        amount: finalAmount,
      });
    }

    // 4. CLEAR CART (If cart order)
    if (items && items.length > 0) {
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
      if (global.io) {
        global.io.to(`cart-${userId}`).emit("cart-update", {
          type: "cart-cleared-after-order",
          cart: { items: [] },
          itemCount: 0,
        });
      }
    } else {
      // Buy Now - Notify stock change
      if (global.io) global.io.to(`cart-${userId}`).emit("cart-update", { type: "stock-changed" });
    }

    // 5. NOTIFICATIONS
    const userEmail = data.email || user.email;
    // if (userEmail) sendOrderConfirmation(userEmail, order).catch(() => { });

    // Notify Sellers
    const sellerIds = new Set();
    for (const item of order.items) {
      const product = await Product.findById(item.product).select("owner");
      if (product?.owner) sellerIds.add(product.owner.toString());
    }

    const notificationType = paymentMethod === "Razorpay" ? "new-order-paid" : "new-order";
    const msg = paymentMethod === "Razorpay" ? "💰 New prepaid order received" : "🆕 New COD order received";

    for (const sellerId of sellerIds) {
      await Notification.create({
        user: sellerId,
        role: "seller",
        type: notificationType,
        message: msg,
        orderId: order._id,
      });
      if (global.io) {
        global.io.to(`seller-${sellerId}`).emit("notification", {
          type: notificationType,
          message: msg,
          orderId: order._id,
        });
      }
    }
    if (global.io) global.io.emit("seller-dashboard-update");


    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (err) {
    console.error("Order processing error:", err);
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
        path: "items.product",
        select: "name variants owner",
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Filter items belonging to this seller and add image URLs
    const sellerItems = order.items
      .filter(item => item.product?.owner?.toString() === sellerId.toString())
      .map(item => {
        // Find the matching variant for this item
        const variant = item.product?.variants?.find(v =>
          v.color.toLowerCase() === item.color?.toLowerCase()
        );

        // Get the first image from the variant
        const image = variant?.images?.[0] || null;

        return {
          ...item.toObject(),
          product: {
            _id: item.product?._id,
            name: item.product?.name,
            variants: item.product?.variants || [],
            owner: item.product?.owner
          },
          // Add image URL to the item itself for easy access
          image: image
        };
      });

    if (sellerItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No items found from your store in this order"
      });
    }

    res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        user: order.user,
        items: sellerItems,
        address: order.address,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus || "pending",
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt
      },
    });
  } catch (err) {
    console.error("Error in getSellerOrderById:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
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

const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const sellerProducts = await Product.find({ owner: sellerId }).select("_id");
    const productIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({
      "items.product": { $in: productIds },
    })
      .populate("user", "name email")
      .populate("items.product", "name price owner");

    const sellerOrders = orders.map(order => {
      const items = order.items.filter(item =>
        productIds.some(id => id.equals(item.product._id))
      );

      return {
        orderId: order._id,
        buyer: order.user,
        items,
        status: order.status,
        paymentStatus: order.paymentStatus || (order.paymentMethod === "Razorpay" ? "paid" : "pending"),
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      orders: sellerOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders",
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
  getAllOrders,
  getSellerOrders,
  verifyPayment,
  trackOrder,
  getMyOrders
};