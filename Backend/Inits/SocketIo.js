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

    // ✅ SELLER / ADMIN ROOM
    if (socket.user.role === "seller" || socket.user.role === "admin") {
      const room = `seller-${socket.user.userId}`;
      socket.join(room);
      console.log("📦 Seller/Admin joined room:", room);
    }

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
