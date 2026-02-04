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
    console.log("🟢 Socket connected:", socket.user.userId, socket.user.role);
    // ✅ BUYER ROOM JOIN (CRITICAL)
    socket.join(`buyer-${socket.user.userId}`);

    // ✅ SELLER ROOM JOIN (CRITICAL)
    if (socket.user.role === "seller") {
      const room = `seller-${socket.user.userId}`;
      socket.join(room);
      console.log("📦 Seller joined room:", room);
    }

    socket.on("join-order", (orderId) => {
      socket.join(orderId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.user.userId);
    });
  });
};

module.exports = initSocket;
