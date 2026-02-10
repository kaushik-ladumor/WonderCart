const Order = require("../Models/Order.Model");
const Product = require("../Models/Product.Model");
const Cart = require("../Models/Cart.Model");
const User = require("../Models/User.Model");
const mongoose = require("mongoose");
const { sendOrderConfirmation } = require('../Middlewares/email');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Notification = require("../Models/Notification.Model");


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
    } = req.body;

    // FIX: Check which environment variable names are being used
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

    console.log("Razorpay Key ID:", RAZORPAY_KEY_ID ? "Present" : "Missing");
    console.log("Razorpay Key Secret:", RAZORPAY_KEY_SECRET ? "Present" : "Missing");

    let razorpayOrder = null;
    if (paymentMethod === "Razorpay") {
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          message: "Payment gateway configuration missing",
        });
      }

      const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });

      razorpayOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      console.log("Razorpay order created:", razorpayOrder.id);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userEmail = user.email;

    let selectedAddress;
    if (addressId) {
      selectedAddress = user.addresses.id(addressId);
    } else {
      selectedAddress = user.addresses.find(a => a.isDefault);
    }

    if (!selectedAddress) {
      return res.status(400).json({ success: false, message: "Address not found" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid total amount required" });
    }

    let orderItems = [];

    if (productId && quantity) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const variant = product.variants.find(v => v.color === color);
      if (!variant) {
        return res.status(400).json({ success: false, message: "Color not available" });
      }

      const sizeObj = variant.sizes.find(s => s.size === size);
      if (!sizeObj) {
        return res.status(400).json({ success: false, message: "Size not available" });
      }

      if (sizeObj.stock < quantity) {
        return res.status(400).json({ success: false, message: `Only ${sizeObj.stock} available` });
      }

      const finalPrice = sizeObj.sellingPrice;

      sizeObj.stock -= quantity;
      await product.save();

      orderItems.push({
        product: productId,
        quantity,
        price: finalPrice,
        name: product.name,
        color,
        size,
      });
    } else if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
        }

        const variant = product.variants.find(v => v.color === item.color);
        if (!variant) {
          return res.status(400).json({ success: false, message: `Color ${item.color} not available` });
        }

        const sizeObj = variant.sizes.find(s => s.size === item.size);
        if (!sizeObj) {
          return res.status(400).json({ success: false, message: `Size ${item.size} not available` });
        }

        if (sizeObj.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${sizeObj.stock} available for ${product.name}`,
          });
        }

        const itemPrice =
          item.price || sizeObj.sellingPrice;

        sizeObj.stock -= item.quantity;
        await product.save();

        orderItems.push({
          product: item.product,
          quantity: item.quantity,
          price: itemPrice,
          name: item.name || product.name,
          color: item.color,
          size: item.size,
        });
      }
    } else {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      razorpayOrderId: razorpayOrder?.id,
      status: "pending",
      address: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
        zipcode: selectedAddress.zipCode,
      },
    });

    console.log("Order Created:", order._id);

    // Only clear cart when order is placed FROM the cart (not Buy Now)
    if (items && items.length > 0) {
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      // Emit cart cleared event
      if (global.io) {
        global.io.to(`cart-${userId}`).emit("cart-update", {
          type: "cart-cleared-after-order",
          cart: { items: [] },
          itemCount: 0,
        });
      }
    } else {
      // Buy Now: Don't clear cart, but notify frontend to refresh cart
      // (stock may have changed, making cart items out of stock)
      if (global.io) {
        global.io.to(`cart-${userId}`).emit("cart-update", {
          type: "stock-changed",
        });
      }
    }

    if (userEmail) {
      try {
        await sendOrderConfirmation(userEmail, order);
      } catch { }
    }

    global.io.emit("seller-dashboard-update");

    // 🔥 FIND SELLERS FROM ORDER ITEMS
    const sellerIds = new Set();

    for (const item of order.items) {
      const product = await Product.findById(item.product).select("owner");
      if (product?.owner) {
        sellerIds.add(product.owner.toString());
      }
    }

    for (const sellerId of sellerIds) {
      await Notification.create({
        user: sellerId,
        role: "seller",
        type: "new-order",
        message: "🆕 New order received",
        orderId: order._id,
      });

      // 2️⃣ REALTIME socket emit (online support)
      global.io.to(`seller-${sellerId}`).emit("notification", {
        type: "new-order",
        message: "🆕 New order received",
        orderId: order._id,
      });

      console.log("🔔 Seller notified:", sellerId);
    }


    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};


const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        status: "processing"
      });

      global.io.to(orderId).emit("order-updated", {
        orderId,
        status: "processing"
      });

      res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};


const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
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
    if (status === "delivered") order.deliveredAt = new Date();
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
  trackOrder
};