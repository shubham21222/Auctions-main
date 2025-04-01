"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";
import { toast } from "react-hot-toast";

export const useMemberSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auctionModes, setAuctionModes] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);
  const isClerk = useSelector((state) => state.auth.isClerk);
  const userName = useSelector((state) => state.auth.name);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    let socketIo = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000;

    const initializeSocket = () => {
      if (!userId || !token) return;

      // If socket exists and is connected, don't create a new one
      if (socket && socket.connected) {
        console.log("Socket already connected:", socket.id);
        return;
      }

      // If socket exists but disconnected, try to reconnect
      if (socket && !socket.connected) {
        console.log("Attempting to reconnect socket...");
        socket.connect();
        return;
      }

      // Create new socket connection
      socketIo = io(`${config.baseURL}`, {
        query: { userId },
        auth: { token, isClerk },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        autoConnect: true,
        forceNew: true,
        timeout: 10000,
        withCredentials: true,
      });

      const eventHandlers = {
        connect: () => {
          console.log("Connected to Socket.IO server:", socketIo.id);
          setIsConnected(true);
          reconnectAttempts = 0;
          addNotification("success", "Connected to auction server!");
        },
        disconnect: (reason) => {
          console.log("Disconnected from Socket.IO server:", reason);
          setIsConnected(false);
          if (reason === "io server disconnect") {
            // Server initiated disconnect, try to reconnect
            socketIo.connect();
          }
        },
        connect_error: (err) => {
          console.error("Socket connection error:", err.message);
          setIsConnected(false);
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            setTimeout(() => {
              console.log(`Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
              socketIo.connect();
            }, RECONNECT_DELAY);
          } else {
            addNotification("error", "Connection lost. Please refresh the page.");
          }
        },
        reconnect: (attemptNumber) => {
          console.log(`Reconnected after ${attemptNumber} attempts`);
          setIsConnected(true);
          reconnectAttempts = 0;
          addNotification("success", "Reconnected to auction server!");
        },
        reconnect_error: (error) => {
          console.error("Reconnection error:", error);
        },
        reconnect_failed: () => {
          console.error("Failed to reconnect");
          addNotification("error", "Connection failed. Please refresh the page.");
        },
        auctionData: (data) => {
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
        },
        bidUpdate: ({ auctionId, bidAmount, bidderId, minBidIncrement, bids, bidType, timestamp }) => {
          console.log("Received bidUpdate:", { auctionId, bidAmount, bidderId, minBidIncrement, bids, bidType, timestamp });
          setLiveAuctions((prev) => {
            return prev.map((auction) => {
              if (auction.id === auctionId) {
                return {
                  ...auction,
                  currentBid: bidAmount,
                  currentBidder: bidderId,
                  minBidIncrement: minBidIncrement || auction.minBidIncrement,
                  bids: bids || [...(auction.bids || []), { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType }],
                };
              }
              return auction;
            });
          });
        },
        auctionMessage: ({ auctionId, message, actionType, sender, timestamp }) => {
          console.log("Received auctionMessage:", { auctionId, message, actionType, sender, timestamp });
          const displayMessage = message || (actionType ? actionType : "Update");
          addNotification("info", displayMessage);
          setLiveAuctions((prev) => {
            return prev.map((auction) => {
              if (auction.id === auctionId) {
                const senderName = typeof sender === "object" ? sender.name || "Admin" : "Admin";
                return {
                  ...auction,
                  messages: [
                    ...(auction.messages || []),
                    { message: displayMessage, actionType, sender: senderName, timestamp: timestamp || new Date(), type: "message" },
                  ],
                };
              }
              return auction;
            });
          });
        },
        auctionEnded: ({ auctionId, winner, message }) => {
          console.log("Received auctionEnded:", { auctionId, winner });
          setLiveAuctions((prev) =>
            prev.map((auction) =>
              auction.id === auctionId ? { ...auction, status: "ENDED", winner: winner || null } : auction
            )
          );
          addNotification("info", message);
        },
        watcherUpdate: ({ auctionId, watchers }) => {
          console.log("Received watcherUpdate:", { auctionId, watchers });
          setLiveAuctions((prev) =>
            prev.map((auction) => (auction.id === auctionId ? { ...auction, watchers } : auction))
          );
        },
        outbidNotification: ({ message, auctionId }) => {
          console.log("Received outbidNotification:", { message, auctionId });
          addNotification("warning", `${message} on auction ${auctionId}`);
        },
        winnerNotification: ({ message, auctionId, finalBid }) => {
          console.log("Received winnerNotification:", { message, auctionId, finalBid });
          addNotification("success", `${message} - Final Bid: $${finalBid}`);
        },
        error: ({ message }) => {
          console.error("Socket error:", message);
          addNotification("error", `Error: ${message}`);
        },
        auctionModeUpdate: ({ auctionId, mode }) => {
          console.log(`Received auctionModeUpdate for auction ${auctionId}: ${mode}`);
          setAuctionModes((prev) => ({
            ...prev,
            [auctionId]: mode,
          }));
        },
      };

      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socketIo.on(event, handler);
      });

      setSocket(socketIo);
    };

    initializeSocket();

    return () => {
      if (socketIo) {
        socketIo.disconnect();
      }
    };
  }, [userId, token, isClerk, addNotification]);

  const joinAuction = useCallback((auctionId) => {
    if (socket && auctionId) {
      socket.emit("joinAuction", { auctionId, userId, isClerk });
      console.log(`Joined auction ${auctionId}`);
    }
  }, [socket, userId, isClerk]);

  const getAuctionData = useCallback((auctionId) => {
    if (socket && auctionId) {
      socket.emit("getAuctionData", { auctionId, userId, isClerk });
      console.log(`Requested data for auction ${auctionId}`);
    }
  }, [socket, userId, isClerk]);

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

  const placeBid = useCallback(async (auctionId, bidType = "online", bidAmount) => {
    if (!socket) {
      toast.error("Socket connection not initialized. Please refresh the page.");
      return;
    }

    if (!socket.connected) {
      toast.error("Connection lost. Attempting to reconnect...");
      socket.connect();
      return;
    }

    try {
      // Emit the bid through socket first
      socket.emit("placeBid", { 
        auctionId, 
        userId: socket.id, 
        bidType, 
        bidAmount: bidAmount.toString() 
      });

      // Then make the API call
      const bidResponse = await fetch(`${config.baseURL}/v1/api/auction/placeBid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          auctionId,
          bidAmount: bidAmount.toString(),
          bidType: bidType,
        }),
      });

      const data = await bidResponse.json();
      if (!bidResponse.ok) {
        throw new Error(data.message || "Failed to place bid");
      }

      toast.success(`Bid placed successfully at $${bidAmount.toLocaleString()}`);
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error(error.message || "Failed to place bid");
    }
  }, [socket, token]);

  const sendMessage = useCallback((auctionId, message) => {
    if (!socket) {
      toast.error("Socket connection not initialized. Please refresh the page.");
      return;
    }

    if (!socket.connected) {
      toast.error("Connection lost. Attempting to reconnect...");
      socket.connect();
      return;
    }

    try {
      // Emit new message event
      socket.emit("newMessage", {
        auctionId,
        message,
        sender: {
          _id: userId,
          name: userName,
          isClerk: isClerk,
        },
        timestamp: new Date(),
      });

      // Update local state
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                messages: [
                  ...(auction.messages || []),
                  {
                    message,
                    sender: {
                      _id: userId,
                      name: userName,
                      isClerk: isClerk,
                    },
                    timestamp: new Date(),
                  },
                ],
              }
            : auction
        )
      );

      // Also emit the message to the catalog page
      socket.emit("auctionMessage", {
        auctionId,
        message,
        sender: {
          _id: userId,
          name: userName,
          isClerk: isClerk,
        },
        timestamp: new Date(),
      });

      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Send Message Error:", error);
      toast.error("Failed to send message");
    }
  }, [socket, userId, userName, isClerk, setLiveAuctions]);

  const performClerkAction = useCallback((auctionId, actionType) => {
    if (socket && auctionId && actionType) {
      socket.emit("clerkAction", { auctionId, actionType, userId, isClerk });
      console.log(`Performed clerk action ${actionType} on auction ${auctionId}`);
    }
  }, [socket, userId, isClerk]);

  const updateAuctionMode = useCallback((auctionId, mode) => {
    if (socket && auctionId && mode) {
      socket.emit("setAuctionMode", { auctionId, mode, userId, isClerk });
      console.log(`Set auction ${auctionId} mode to: ${mode}`);
    }
  }, [socket, userId, isClerk]);

  useEffect(() => {
    if (!socket) return;

    const handleAuctionMode = ({ auctionId, mode }) => {
      console.log(`Received auction mode update for ${auctionId}: ${mode}`);
      setAuctionModes((prev) => ({
        ...prev,
        [auctionId]: mode,
      }));
    };

    const handleAuctionMessage = ({ auctionId, message, actionType, sender, timestamp, bidAmount, bidType }) => {
      console.log("Received auction message:", { auctionId, message, actionType, sender, timestamp, bidAmount, bidType });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                messages: [
                  ...(auction.messages || []),
                  {
                    message: message || actionType,
                    bidTime: timestamp || new Date(),
                    sender: typeof sender === "object" ? sender.name || "Admin" : "Admin",
                    bidType: bidType || (message ? "message" : actionType),
                    bidAmount: bidAmount || (bidType === "competitor" && auction.bids?.length > 0 ? auction.bids[auction.bids.length - 1].bidAmount + getBidIncrement(auction.bids[auction.bids.length - 1].bidAmount || 0) : auction.startingBid),
                  },
                ],
              }
            : auction
        )
      );
    };

    const handleBidUpdate = ({ auctionId, bidAmount, bidderId, bidType, timestamp }) => {
      console.log("Received bid update:", { auctionId, bidAmount, bidderId, bidType, timestamp });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                currentBid: bidAmount,
                bids: [
                  ...(auction.bids || []),
                  {
                    bidder: bidderId,
                    bidAmount,
                    bidTime: timestamp || new Date(),
                    bidType,
                    isClerk: isClerk,
                  },
                ],
              }
            : auction
        )
      );
    };

    const handleAuctionUpdate = ({ auctionId, updateData }) => {
      console.log("Received auction update:", { auctionId, updateData });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                ...updateData,
              }
            : auction
        )
      );
    };

    socket.on("auctionMode", handleAuctionMode);
    socket.on("auctionMessage", handleAuctionMessage);
    socket.on("bidUpdate", handleBidUpdate);
    socket.on("auctionUpdate", handleAuctionUpdate);

    return () => {
      socket.off("auctionMode", handleAuctionMode);
      socket.off("auctionMessage", handleAuctionMessage);
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("auctionUpdate", handleAuctionUpdate);
    };
  }, [socket, isClerk, getBidIncrement]);

  return {
    socket,
    liveAuctions,
    setLiveAuctions,
    joinAuction,
    placeBid,
    getAuctionData,
    sendMessage,
    performClerkAction,
    updateAuctionMode,
    auctionModes,
    notifications,
    getBidIncrement,
  };
}; 