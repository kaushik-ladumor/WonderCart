const jwt = require("jsonwebtoken");

const initSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      "🟢 Socket connected:",
      socket.user.userId,
      socket.user.role
    );

    // ✅ BUYER ROOM
    socket.join(`buyer-${socket.user.userId}`);
    console.log("📦 Buyer joined room:", `buyer-${socket.user.userId}`);

    // ✅ CART ROOM (for real-time cart updates)
    socket.join(`cart-${socket.user.userId}`);
    console.log("🛒 Joined cart room:", `cart-${socket.user.userId}`);

    // ✅ WISHLIST ROOM (for real-time wishlist updates)
    socket.join(`wishlist-${socket.user.userId}`);
    console.log("❤️ Joined wishlist room:", `wishlist-${socket.user.userId}`);

    // ✅ SELLER / ADMIN ROOM
    if (socket.user.role === "seller" || socket.user.role === "admin") {
      const room = `seller-${socket.user.userId}`;
      socket.join(room);
      console.log("📦 Seller/Admin joined room:", room);
    }

    if (socket.user.role === "admin") {
      socket.join("admin_room");
      console.log("👮 Joined Admin Broadcast Room");
    }

    // ✅ PERSONAL NOTIFICATION ROOM
    socket.join(socket.user.userId);
    console.log("🔔 Personal room joined:", socket.user.userId);

    // ✅ ORDER ROOM
    socket.on("join-order", (orderId) => {
      socket.join(orderId);
      console.log("📦 Joined order room:", orderId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.user.userId);
    });
  });
};

module.exports = initSocket;
