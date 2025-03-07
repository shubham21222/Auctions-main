// hooks/useSocket.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]); // Custom notification state
  const [isMounted, setIsMounted] = useState(false);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);

  // Add notification with type and message
  const addNotification = (type, message) => {
    const id = Date.now(); // Unique ID for each notification
    setNotifications((prev) => [...prev, { id, type, message }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    if (!userId || !token) {
      console.log("Missing userId or token, skipping socket connection");
      return;
    }

    const socketIo = io("https://bid.nyelizabeth.com:4000", {
      query: { userId },
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(socketIo);
    setIsMounted(true);

    return () => {
      socketIo.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, [userId, token]);

  useEffect(() => {
    if (!socket || !isMounted) return;

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
      addNotification("success", "Connected to auction server!");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      addNotification("error", `Connection failed: ${err.message}`);
    });

    socket.on("bidUpdate", ({ auctionId, bidAmount, userId: bidderId }) => {
      console.log("Received bidUpdate:", { auctionId, bidAmount, bidderId });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, currentBid: bidAmount, currentBidder: bidderId }
            : auction
        )
      );
      if (bidderId !== userId) {
        addNotification("success", `New bid on auction ${auctionId}: $${bidAmount}`);
      }
    });

    socket.on("auctionEnded", ({ auctionId, winner }) => {
      console.log("Received auctionEnded:", { auctionId, winner });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, status: "ENDED", winner: winner || null }
            : auction
        ).filter((auction) => auction.status !== "ENDED")
      );
      addNotification("info", `Auction ${auctionId} has ended. Winner: ${winner || "N/A"}`);
    });

    socket.on("watcherUpdate", ({ auctionId, watchers }) => {
      console.log("Received watcherUpdate:", { auctionId, watchers });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId ? { ...auction, watchers } : auction
        )
      );
      addNotification("info", `${watchers} users are watching auction ${auctionId}`);
    });

    socket.on("outbidNotification", ({ message, auctionId }) => {
      console.log("Received outbidNotification:", { message, auctionId });
      addNotification("error", `${message} on auction ${auctionId}`);
    });

    socket.on("winnerNotification", ({ message, auctionId, finalBid }) => {
      console.log("Received winnerNotification:", { message, auctionId, finalBid });
      addNotification("success", `${message} Auction ${auctionId} - Final Bid: $${finalBid}`);
    });

    socket.on("error", ({ message }) => {
      console.error("Socket error:", message);
      addNotification("error", `Error: ${message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("bidUpdate");
      socket.off("auctionEnded");
      socket.off("watcherUpdate");
      socket.off("outbidNotification");
      socket.off("winnerNotification");
      socket.off("error");
    };
  }, [socket, isMounted, userId]);

  const joinAuction = useCallback(
    (auctionId) => {
      if (socket && auctionId) {
        socket.emit("joinAuction", { auctionId });
        console.log(`Joined auction room: ${auctionId}`);
      } else {
        console.log("Cannot join auction: socket or auctionId missing", { socket, auctionId });
      }
    },
    [socket]
  );

  const placeBid = useCallback(
    (auctionId, bidAmount) => {
      if (socket && auctionId && bidAmount) {
        socket.emit("placeBid", { auctionId, bidAmount, userId });
        console.log(`Placed bid on auction ${auctionId}: $${bidAmount} by user ${userId}`);
      } else {
        console.log("Cannot place bid: missing socket, auctionId, or bidAmount", {
          socket,
          auctionId,
          bidAmount,
        });
      }
    },
    [socket, userId]
  );

  return { socket, liveAuctions, setLiveAuctions, joinAuction, placeBid, notifications };
};