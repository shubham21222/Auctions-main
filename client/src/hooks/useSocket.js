"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auctionModes, setAuctionModes] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  useEffect(() => {
    let socketIo = null;

    const initializeSocket = () => {
      if (!userId || !token || socket) return;

      socketIo = io("https://bid.nyelizabeth.com", {
        query: { userId },
        auth: { token, isAdmin: isAdmin || false },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        autoConnect: true,
        forceNew: false,
      });

      socketIo.on("connect", () => {
        console.log("Connected to Socket.IO server:", socketIo.id);
        setIsConnected(true);
        addNotification("success", "Connected to auction server!");
      });

      socketIo.on("disconnect", (reason) => {
        console.log("Disconnected from Socket.IO server:", reason);
        setIsConnected(false);
        addNotification("warning", "Disconnected from server. Reconnecting...");
      });

      socketIo.on("reconnect", (attempt) => {
        console.log("Reconnected to Socket.IO server after", attempt, "attempts");
        setIsConnected(true);
        addNotification("success", "Reconnected to auction server!");
      });

      socketIo.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setIsConnected(false);
        addNotification("error", `Connection failed: ${err.message}`);
      });

      socketIo.on("auctionData", (data) => {
        console.log("Received auctionData:", data);
        setLiveAuctions((prev) => {
          const auctionId = data._id || data.auctionId;
          if (!auctionId) return prev;
          const exists = prev.find((a) => a.id === auctionId);
          return exists
            ? prev.map((a) => (a.id === auctionId ? { ...a, ...data, id: auctionId } : a))
            : [...prev, { ...data, id: auctionId }];
        });
      });

      socketIo.on("auctionMessage", ({ auctionId, message, actionType, sender, timestamp, bidType }) => {
        console.log("Received auctionMessage:", { auctionId, message, actionType, sender, timestamp, bidType });
        const displayMessage = message || actionType || "Update";
        addNotification("info", displayMessage);
        setLiveAuctions((prev) =>
          prev.map((auction) =>
            auction.id === auctionId
              ? {
                  ...auction,
                  messages: [
                    ...(auction.messages || []),
                    {
                      message: displayMessage,
                      actionType,
                      sender: typeof sender === "object" ? sender.name || "Admin" : sender || "Admin",
                      timestamp: timestamp || new Date(),
                      bidType: bidType || "message",
                    },
                  ],
                }
              : auction
          )
        );
      });

      socketIo.on("bidUpdate", ({ auctionId, bidAmount, bidderId, bidType, timestamp }) => {
        console.log("Received bidUpdate:", { auctionId, bidAmount, bidderId, bidType, timestamp });
        setLiveAuctions((prev) =>
          prev.map((auction) =>
            auction.id === auctionId
              ? {
                  ...auction,
                  currentBid: bidAmount,
                  currentBidder: bidderId,
                  bids: [
                    ...(auction.bids || []),
                    { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType },
                  ],
                }
              : auction
          )
        );
      });

      socketIo.on("watcherUpdate", ({ auctionId, watchers }) => {
        console.log("Received watcherUpdate:", { auctionId, watchers });
        setLiveAuctions((prev) =>
          prev.map((auction) => (auction.id === auctionId ? { ...auction, watchers } : auction))
        );
      });

      socketIo.on("auctionModeUpdate", ({ auctionId, mode }) => {
        console.log(`Received auctionModeUpdate for auction ${auctionId}: ${mode}`);
        setAuctionModes((prev) => ({ ...prev, [auctionId]: mode }));
      });

      setSocket(socketIo);

      return () => {
        if (socketIo) {
          socketIo.disconnect();
          setIsConnected(false);
          setSocket(null);
          console.log("Socket disconnected during cleanup");
        }
      };
    };

    initializeSocket();
  }, [userId, token, isAdmin, addNotification]);

  const joinAuction = useCallback((auctionId) => {
    if (socket && auctionId) {
      socket.emit("joinAuction", { auctionId });
      console.log(`Joined auction room: ${auctionId}`);
    }
  }, [socket]);

  const getAuctionData = useCallback((auctionId) => {
    return new Promise((resolve, reject) => {
      if (!socket || !auctionId) {
        reject(new Error("Socket or auctionId not available"));
        return;
      }

      if (!socket.connected) {
        socket.connect();
        console.log("Socket was disconnected, attempting to reconnect...");
      }

      socket.emit("getAuctionData", { auctionId });
      console.log(`Requested auction data for: ${auctionId}`);

      const onAuctionData = (data) => {
        if (data._id === auctionId || data.auctionId === auctionId) {
          socket.off("auctionData", onAuctionData);
          socket.off("auctionDataError", onError);
          resolve(data);
        }
      };

      const onError = (error) => {
        socket.off("auctionData", onAuctionData);
        socket.off("auctionDataError", onError);
        reject(error);
      };

      socket.on("auctionData", onAuctionData);
      socket.on("auctionDataError", onError);

      setTimeout(() => {
        socket.off("auctionData", onAuctionData);
        socket.off("auctionDataError", onError);
        reject(new Error("Timeout waiting for auction data"));
      }, 15000);
    });
  }, [socket]);

  const getBidIncrement = useCallback((currentBid) => {
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
  }, []);

  const placeBid = useCallback(
    async (auctionId, bidType = "online", bidAmount) => {
      if (!socket || !auctionId) return;

      try {
        const auctionData = await getAuctionData(auctionId);
        const currentMode = auctionModes[auctionId] || "online";

        if (bidType === "competitor" && currentMode !== "competitor") {
          addNotification("error", "Auction is not in competitor bid mode.");
          return;
        }

        const currentBid = auctionData.currentBid || 0;
        const increment = getBidIncrement(currentBid);
        const newBidAmount = bidAmount || currentBid + increment;

        if (newBidAmount <= currentBid) {
          addNotification("error", "Your bid must be higher than the current bid.");
          return;
        }

        socket.emit("placeBid", { auctionId, userId, bidType, bidAmount: newBidAmount });
        console.log(`Placed ${bidType} bid on auction ${auctionId} for $${newBidAmount}`);
      } catch (error) {
        addNotification("error", `Failed to place bid: ${error.message}`);
      }
    },
    [socket, userId, auctionModes, getAuctionData, getBidIncrement, addNotification]
  );

  const sendMessage = useCallback(
    (auctionId, message) => {
      if (socket && auctionId && message) {
        socket.emit("sendMessage", { auctionId, message, userId, isAdmin });
        console.log(`Sent message to auction ${auctionId}: ${message}`);
      }
    },
    [socket, userId, isAdmin]
  );

  const performAdminAction = useCallback(
    (auctionId, actionType) => {
      if (socket && auctionId && actionType) {
        socket.emit("adminAction", { auctionId, actionType, userId, isAdmin });
        console.log(`Performed admin action ${actionType} on auction ${auctionId}`);
      }
    },
    [socket, userId, isAdmin]
  );

  const updateAuctionMode = useCallback(
    (auctionId, mode) => {
      if (socket && auctionId && mode) {
        socket.emit("setAuctionMode", { auctionId, mode, userId, isAdmin });
        console.log(`Set auction ${auctionId} mode to: ${mode}`);
      }
    },
    [socket, userId, isAdmin]
  );

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
    isConnected,
  };
};