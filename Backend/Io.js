const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmM1ZmMwOTY3ZWYxYjNhYWIxOWQwZSIsInVzZXIiOiJrYXVzaGlrIiwiZW1haWwiOiJjaGhhZ2Fuc3Rha2VAZ21haWwuY29tIiwiaWF0IjoxNzY0ODQ4NjY2LCJleHAiOjE3NjQ4NTIyNjZ9.3mJLnwW_RLOWqvWlXowl9cCmZYz7Aqyf61eRKI_OqMM",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("ping");
});

socket.on("pong", (data) => {
  console.log("Received from server:", data);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});
