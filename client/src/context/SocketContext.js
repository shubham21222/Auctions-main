// context/SocketContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!userId || !token) return;

    const socketIo = io("https://bid.nyelizabeth.com", {
      query: { userId },
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to Socket.IO server:", socketIo.id);
    });

    socketIo.on("error", ({ message }) => {
      console.error("Socket error:", message);
    });

    return () => {
      socketIo.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, [userId, token]);

  return (
    <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);