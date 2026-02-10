import { createContext, useContext, useEffect } from "react";
import socket from "../socket";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { authUser } = useAuth();

  useEffect(() => {
    if (!authUser) return;

    socket.connect();

    socket.emit("joinRoom", {
      userId: authUser._id,
      role: authUser.role,
    });

    return () => {
      socket.disconnect();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
