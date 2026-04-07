import React, { createContext, useContext, useEffect } from "react";
import socket from "../socket";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { authUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!authUser || !token) {
        if (socket.connected) socket.disconnect();
        return;
    }

    // Set token dynamically before connecting
    socket.auth.token = token;
    socket.connect();

    socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
        
        // Joined rooms are usually handled on the backend connection event, 
        // but we can emit a join event if needed for specific logic.
        socket.emit("join-user-rooms", {
            userId: authUser._id,
            role: authUser.role
        });
    });

    socket.on("disconnect", () => {
        console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Socket Connection Error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
