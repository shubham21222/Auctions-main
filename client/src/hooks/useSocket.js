"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auctionModes, setAuctionModes] = useState({});
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!userId || !token) {
      console.log("Missing userId or token, skipping socket connection", { userId, token });
      return;
    }

    const socketIo = io("https://bid.nyelizabeth.com", {
      query: { userId },
      auth: { token, isAdmin: isAdmin || true },
      transports: ["websocket"],
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to Socket.IO server:", socketIo.id);
      addNotification("success", "Connected to auction server!");
    });

    socketIo.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      addNotification("error", `Connection failed: ${err.message}`);
    });

    socketIo.on("auctionData", (data) => {
      console.log("Received auctionData:", data);
      setLiveAuctions((prev) => {
        const auctionId = data._id || data.auctionId;
        if (!auctionId) {
          console.error("Auction ID missing in auctionData:", data);
          return prev;
        }
        const exists = prev.find((a) => a.id === auctionId);
        return exists
          ? prev.map((a) => (a.id === auctionId ? { ...a, ...data, id: auctionId } : a))
          : [...prev, { ...data, id: auctionId }];
      });
    });

    socketIo.on("bidUpdate", ({ auctionId, bidAmount, bidderId, minBidIncrement, bids, bidType }) => {
      console.log("Received bidUpdate:", { auctionId, bidAmount, bidderId, minBidIncrement, bids, bidType });
      setLiveAuctions((prev) => {
        const updatedAuctions = prev.map((auction) => {
          if (auction.id === auctionId) {
            return {
              ...auction,
              currentBid: bidAmount,
              currentBidder: bidderId,
              minBidIncrement: minBidIncrement || auction.minBidIncrement,
              bids: bids || auction.bids,
            };
          }
          return auction;
        });
        return updatedAuctions;
      });
      if (bidderId !== userId) {
        addNotification("success", `New ${bidType || "online"} bid on auction ${auctionId}: $${bidAmount}`);
      }
    });

    socketIo.on("auctionEnded", ({ auctionId, winner, message }) => {
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

    socketIo.on("watcherUpdate", ({ auctionId, watchers }) => {
      console.log("Received watcherUpdate:", { auctionId, watchers });
      setLiveAuctions((prev) =>
        prev.map((auction) => (auction.id === auctionId ? { ...auction, watchers } : auction))
      );
    });

    socketIo.on("outbidNotification", ({ message, auctionId }) => {
      console.log("Received outbidNotification:", { message, auctionId });
      addNotification("warning", `${message} on auction ${auctionId}`);
    });

    socketIo.on("winnerNotification", ({ message, auctionId, finalBid }) => {
      console.log("Received winnerNotification:", { message, auctionId, finalBid });
      addNotification("success", `${message} - Final Bid: $${finalBid}`);
    });

    socketIo.on("error", ({ message }) => {
      console.error("Socket error:", message);
      addNotification("error", `Error: ${message}`);
    });

    socketIo.on("auctionMessage", ({ auctionId, message, actionType, sender, timestamp }) => {
      console.log("Received auctionMessage:", { auctionId, message, actionType, sender, timestamp });
      if (message) {
        addNotification("info", message);
      } else if (actionType) {
        addNotification("info", actionType);
      }
    });

    socketIo.on("auctionModeUpdate", ({ auctionId, mode }) => {
      console.log(`Received auctionModeUpdate for auction ${auctionId}: ${mode}`);
      setAuctionModes((prev) => ({
        ...prev,
        [auctionId]: mode,
      }));
    });

    return () => {
      socketIo.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, [userId, token, isAdmin, addNotification]);

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
    (auctionId, bidType = "online", currentBid = 0) => {
      if (socket && auctionId) {
        let newBidAmount;
        if (bidType === "competitor") {
          const increment = getBidIncrement(currentBid);
          newBidAmount = currentBid + increment;
        } else {
          newBidAmount = currentBid; // For online bids, this should be adjusted
        }

        socket.emit("placeBid", { 
          auctionId, 
          userId, 
          bidType, 
          bidAmount: newBidAmount 
        });
        console.log(`Placed ${bidType} bid on auction ${auctionId} by user ${userId} for $${newBidAmount}`);
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

  const sendMessage = useCallback(
    (auctionId, message) => {
      if (socket && auctionId && message) {
        socket.emit("sendMessage", { auctionId, message, userId, isAdmin: isAdmin || true });
        console.log(`Sent message to auction ${auctionId}: ${message}`);
      }
    },
    [socket, userId, isAdmin]
  );

  const performAdminAction = useCallback(
    (auctionId, actionType) => {
      if (socket && auctionId && actionType) {
        socket.emit("adminAction", { auctionId, actionType, userId, isAdmin: isAdmin || true });
        console.log(`Performed admin action ${actionType} on auction ${auctionId}`);
      }
    },
    [socket, userId, isAdmin]
  );

  const updateAuctionMode = useCallback(
    (auctionId, mode) => {
      if (socket && auctionId && mode) {
        socket.emit("setAuctionMode", { auctionId, mode, userId, isAdmin: isAdmin || true });
        console.log(`Set auction ${auctionId} mode to: ${mode}`);
      }
    },
    [socket, userId, isAdmin]
  );

  const getBidIncrement = (currentBid) => {
    if (currentBid >= 1000000) return 50000;
    if (currentBid >= 500000) return 25000;
    if (currentBid >= 250000) return 10000;
    if (currentBid >= 100000) return 5000;
    if (currentBid >= 50000) return 2500;
    if (currentBid >= 25025) return 1000;
    if (currentBid >= 10000) return 500;
    if (currentBid >= 5000) return 250;
    if (currentBid >= 1000) return 100;
    if (currentBid >= 100) return 50;
    if (currentBid >= 50) return 10;
    if (currentBid >= 25) return 5;
    return 1;
  };

  return {
    socket,
    liveAuctions,
    setLiveAuctions,
    joinAuction,
    placeBid,
    getAuctionData,
    sendMessage,
    performAdminAction,
    updateAuctionMode,
    auctionModes,
    notifications,
    getBidIncrement,
  };
};