const jwt = require("jsonwebtoken");

const initSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      "Socket connected:",
      socket.id,
      "username:",
      socket.user?.user,
      "email:",
      socket.user?.email
    );

    socket.on("ping", () => {
      socket.emit("pong", { message: "OK", user: socket.user });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = initSocket;
