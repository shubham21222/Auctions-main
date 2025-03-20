"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);

  // Add notification helper
  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !token) {
      console.log("Missing userId or token, skipping socket connection");
      return;
    }

    const socketIo = io("https://bid.nyelizabeth.com", {
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

  // Socket event listeners
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

    socket.on("auctionData", (data) => {
      console.log("Received auctionData:", data);
      setLiveAuctions((prev) => {
        const exists = prev.find((a) => a.auctionId === data.auctionId);
        if (!exists) return [...prev, { ...data, id: data.auctionId }];
        return prev.map((a) => (a.auctionId === data.auctionId ? { ...a, ...data, id: data.auctionId } : a));
      });
    });

    socket.on("bidUpdate", ({ auctionId, bidAmount, bidderId, minBidIncrement, bids }) => {
      console.log("Received bidUpdate:", { auctionId, bidAmount, bidderId });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                currentBid: bidAmount,
                currentBidder: bidderId,
                minBidIncrement: minBidIncrement || auction.minBidIncrement,
                bids: bids || auction.bids,
              }
            : auction
        )
      );
      if (bidderId !== userId) {
        addNotification("success", `New bid on auction ${auctionId}: $${bidAmount}`);
      }
    });

    socket.on("auctionEnded", ({ auctionId, winner, message }) => {
      console.log("Received auctionEnded:", { auctionId, winner });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, status: "ENDED", winner: winner || null }
            : auction
        )
      );
      addNotification("info", message);
    });

    socket.on("watcherUpdate", ({ auctionId, watchers }) => {
      console.log("Received watcherUpdate:", { auctionId, watchers });
      setLiveAuctions((prev) =>
        prev.map((auction) => (auction.id === auctionId ? { ...auction, watchers } : auction))
      );
    });

    socket.on("outbidNotification", ({ message, auctionId }) => {
      console.log("Received outbidNotification:", { message, auctionId });
      addNotification("warning", `${message} on auction ${auctionId}`);
    });

    socket.on("winnerNotification", ({ message, auctionId, finalBid }) => {
      console.log("Received winnerNotification:", { message, auctionId, finalBid });
      addNotification("success", `${message} - Final Bid: $${finalBid}`);
    });

    socket.on("error", ({ message }) => {
      console.error("Socket error:", message);
      addNotification("error", `Error: ${message}`);
    });

    // Add listener for auctionMessage (admin messages)
    socket.on("auctionMessage", ({ auctionId, actionType }) => {
      console.log("Received auctionMessage:", { auctionId, actionType });
      addNotification("info", `Admin: ${actionType}`);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("auctionData");
      socket.off("bidUpdate");
      socket.off("auctionEnded");
      socket.off("watcherUpdate");
      socket.off("outbidNotification");
      socket.off("winnerNotification");
      socket.off("error");
      socket.off("auctionMessage");
    };
  }, [socket, isMounted, userId, addNotification]);

  // Socket actions
  const joinAuction = useCallback(
    (auctionId) => {
      if (socket && auctionId) {
        socket.emit("joinAuction", { auctionId });
        console.log(`Joined auction room: ${auctionId}`);
      }
    },
    [socket]
  );

  const placeBid = useCallback(
    (auctionId, bidAmount) => {
      if (socket && auctionId && bidAmount) {
        socket.emit("placeBid", { auctionId, bidAmount, userId });
        console.log(`Placed bid on auction ${auctionId}: $${bidAmount} by user ${userId}`);
      }
    },
    [socket, userId]
  );

  const getAuctionData = useCallback(
    (auctionId) => {
      if (socket && auctionId) {
        socket.emit("getAuctionData", { auctionId });
        console.log(`Requested auction data for: ${auctionId}`);
      }
    },
    [socket]
  );

  return {
    socket,
    liveAuctions,
    setLiveAuctions,
    joinAuction,
    placeBid,
    getAuctionData,
    notifications,
  };
};