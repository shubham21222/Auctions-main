"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";
import toast from "react-hot-toast";

const normalizeId = (id) => {
  if (!id) return "";
  return typeof id === "object" ? id.toString() : id.toString();
};

export const useMemberSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auctionModes, setAuctionModes] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);
  const userRole = useSelector((state) => state.auth.user?.role);
  const permissions = useSelector((state) => state.auth.user?.permissions || []);
  const userName = useSelector((state) => state.auth.name);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const updateAuctionMode = useCallback((auctionId, mode) => {
    if (socket && auctionId && mode) {
      console.log(`Attempting to set auction ${auctionId} mode to: ${mode} as ${userRole}, permissions:`, permissions);
      if (userRole !== "clerk") {
        console.error("You don't have permission to set auction mode");
        addNotification("error", "You don't have permission to set auction mode");
        return;
      }

      socket.emit("setAuctionMode", {
        auctionId: normalizeId(auctionId),
        mode,
        userId,
        role: userRole,
        permissions,
      }, (response) => {
        if (response && response.error) {
          console.error("Error setting auction mode:", response.error);
          addNotification("error", `Failed to set auction mode: ${response.error.message}`);
          return;
        }
        console.log(`Successfully set auction ${auctionId} mode to: ${mode}`);
      setAuctionModes((prev) => ({
        ...prev,
        [normalizeId(auctionId)]: mode,
      }));
      });
    }
  }, [socket, userId, userRole, permissions, addNotification]);

  const joinAuction = useCallback((auctionId) => {
    if (socket && auctionId) {
      socket.emit("joinAuction", { auctionId: normalizeId(auctionId), userId, role: userRole });
      console.log(`Joined auction room: ${auctionId} as ${userRole}`);
    }
  }, [socket, userId, userRole]);

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

      let retryCount = 0;
      const maxRetries = 3;
      const timeoutDuration = 30000;

      const tryGetAuctionData = () => {
        console.log(`Attempting to get auction data (attempt ${retryCount + 1}/${maxRetries})`);

      socket.emit("getAuctionData", { auctionId: normalizeId(auctionId) });

        const timeoutId = setTimeout(() => {
          socket.off("auctionData", onAuctionData);
          socket.off("auctionDataError", onError);
          
          if (retryCount < maxRetries - 1) {
            console.log(`Attempt ${retryCount + 1} timed out, retrying...`);
            retryCount++;
            tryGetAuctionData();
          } else {
            reject(new Error(`Timeout waiting for auction data after ${maxRetries} attempts`));
          }
        }, timeoutDuration);

        const onAuctionData = (data) => {
          if (normalizeId(data._id) === normalizeId(auctionId) || normalizeId(data.auctionId) === normalizeId(auctionId)) {
            clearTimeout(timeoutId);
          socket.off("auctionData", onAuctionData);
          socket.off("auctionDataError", onError);
          resolve(data);
        }
      };

      const onError = (error) => {
          clearTimeout(timeoutId);
        socket.off("auctionData", onAuctionData);
        socket.off("auctionDataError", onError);
        reject(error);
      };

      socket.on("auctionData", onAuctionData);
      socket.on("auctionDataError", onError);
      };

      tryGetAuctionData();
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

  const placeBid = useCallback(async (auctionId, bidType = "online", bidAmount) => {
    if (!socket || !auctionId || !userId) {
      toast.error("Socket, auction ID, or user ID not available");
      console.log("placeBid failed: Socket, auctionId, or userId missing");
      return false;
    }

    console.log("Attempting to place bid:", {
      auctionId,
      bidType,
      bidAmount,
      userRole,
      userId,
      socketConnected: socket.connected
    });

    // Client-side role validation
    if (bidType === "competitor" && userRole !== "clerk") {
      toast.error("Only clerks can place competitor bids");
        return false;
      }

    const maxRetries = 3;
    let retryCount = 0;

    const attemptBid = async () => {
      try {
        if (!socket.connected) {
          console.log("Socket disconnected, attempting to reconnect...");
          socket.connect();
          await new Promise((resolve) => {
            const checkConnection = () => {
              if (socket.connected) {
                resolve();
              } else if (retryCount < maxRetries) {
                setTimeout(checkConnection, 1000);
              } else {
                resolve();
              }
            };
            checkConnection();
          });

          if (!socket.connected) {
            throw new Error("Failed to reconnect socket");
          }
        }

        const bidData = {
        auctionId: normalizeId(auctionId),
        userId,
        bidType, 
        bidAmount,
          role: userRole?.toLowerCase() || "user"
        };

        console.log("Emitting placeBid with data:", bidData);

        return new Promise((resolve, reject) => {
          let bidConfirmed = false;
          const timeoutDuration = 10000; // Reduced to 10 seconds per attempt

          const timeoutId = setTimeout(() => {
            if (!bidConfirmed) {
              socket.off("bidUpdate");
              socket.off("error");
              if (retryCount < maxRetries - 1) {
                console.log(`Bid attempt ${retryCount + 1} timed out, retrying...`);
                retryCount++;
                resolve(attemptBid());
              } else {
                reject(new Error("Bid placement timeout after all retries"));
              }
            }
          }, timeoutDuration);

          const handleBidUpdate = (data) => {
            if (normalizeId(data.auctionId) === normalizeId(auctionId) &&
                data.bidderId === userId) {
              bidConfirmed = true;
              clearTimeout(timeoutId);
              socket.off("bidUpdate", handleBidUpdate);
              socket.off("error", handleError);
              console.log("Bid confirmed:", data);
              resolve(true);
            }
          };

          const handleError = (error) => {
            bidConfirmed = true;
            clearTimeout(timeoutId);
            socket.off("bidUpdate", handleBidUpdate);
            socket.off("error", handleError);
            console.error("Bid error:", error);
            reject(new Error(error.message || "Bid placement failed"));
          };

          socket.on("bidUpdate", handleBidUpdate);
          socket.on("error", handleError);

          socket.emit("placeBid", bidData, (response) => {
            if (response && response.error) {
              bidConfirmed = true;
              clearTimeout(timeoutId);
              socket.off("bidUpdate", handleBidUpdate);
              socket.off("error", handleError);
              console.error("Server rejected bid:", response.error);
              reject(new Error(response.error.message || "Server rejected bid"));
            }
          });
        });
      } catch (error) {
        if (retryCount < maxRetries - 1) {
          console.log(`Attempt ${retryCount + 1} failed, retrying...`);
          retryCount++;
          return attemptBid();
        }
        throw error;
      }
    };

    try {
      const result = await attemptBid();
      return result;
    } catch (error) {
      console.error("Error placing bid:", error);
      addNotification("error", `Failed to place bid: ${error.message}`);
      return false;
    }
  }, [socket, userId, userRole, addNotification]);

  const sendMessage = useCallback((auctionId, message) => {
    if (!socket || !auctionId || !message) {
      toast.error("Socket, auction ID, or message not available");
      return;
    }

    console.log("Attempting to send message:", {
      auctionId,
      message,
      userRole,
      userId
    });

    // Check if user has permission to send messages
    if (userRole !== "clerk" && userRole !== "admin") {
      toast.error("You don't have permission to send messages");
      return;
    }

      socket.emit("sendMessage", {
        auctionId: normalizeId(auctionId),
        message,
        userId,
      role: userRole
    });

    console.log(`Message sent to auction ${auctionId} by ${userRole} ${userId}`);
  }, [socket, userId, userRole]);

  const performClerkAction = useCallback((auctionId, actionType) => {
    if (socket && auctionId && actionType && userRole === "clerk") {
      // Create a message based on the action type
      let message = "";
      switch (actionType) {
        case "FAIR_WARNING":
          message = "⚠️ FAIR WARNING";
          break;
        case "FINAL_CALL":
          message = "🔔 FINAL CALL";
          break;
        case "SOLD":
          message = "🎉 SOLD!";
          break;
        case "RESERVE_NOT_MET":
          message = "❌ Reserve Not Met";
          break;
        case "NEXT_LOT":
          message = "➡️ Moving to Next Lot";
          break;
        case "RETRACT":
          message = "⚠️ Last Bid Retracted";
          break;
        default:
          message = actionType;
      }

      // Emit the clerk action
      socket.emit("clerkAction", {
        auctionId: normalizeId(auctionId),
        actionType,
        userId,
        role: userRole,
        message,
      });

      // Also emit a message to ensure it shows in the history
      socket.emit("sendMessage", {
        auctionId: normalizeId(auctionId),
        message,
        userId,
        role: userRole,
        type: "clerk_action"
      });

      console.log(`Clerk performed action ${actionType} on auction ${auctionId}`);
      addNotification("success", `Action "${actionType}" performed successfully!`);
    } else if (userRole !== "clerk") {
      addNotification("error", "Only clerks can perform this action.");
    }
  }, [socket, userId, userRole, addNotification]);

  useEffect(() => {
    console.log("Current role from Redux:", userRole);
  }, [userRole]);

  useEffect(() => {
    let socketIo = null;

    const initializeSocket = () => {
      if (!userId || !token) {
        console.error("Cannot initialize socket: missing userId or token");
        return;
      }

      if (socket) {
        console.log("Socket already exists, cleaning up...");
        socket.disconnect();
        setSocket(null);
      }

      console.log("Initializing socket with user data:", {
        userId,
        role: userRole,
        permissions
      });

      socketIo = io(config.baseURL, {
        query: { 
          userId,
          role: userRole,
          permissions: JSON.stringify(permissions),
        },
        auth: { 
          token,
          role: userRole,
          permissions,
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      socketIo.on("connect", () => {
        console.log("Socket connected with ID:", socketIo.id, "Role:", userRole);
        
        // Emit role update on connection
        socketIo.emit("updateRole", { role: userRole });
        
        setSocket(socketIo);
        setIsConnected(true);
        addNotification("success", "Connected to auction server!");
      });

      socketIo.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
        if (reason === "io server disconnect" || reason === "io client disconnect") {
          setSocket(null);
        }
        addNotification("warning", "Disconnected from server. Reconnecting...");
      });

      socketIo.on("reconnect", (attempt) => {
        console.log("Reconnected to Socket.IO server after", attempt, "attempts");
        setIsConnected(true);
        addNotification("success", "Reconnected to auction server!");
      });

      socketIo.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        toast.error(`Socket connection error: ${error.message}`);
        addNotification("error", `Connection failed: ${error.message}`);
      });

      socketIo.on("error", (error) => {
        console.error("Socket error:", error);
        if (error.message?.includes("Unauthorized") || error.message?.includes("admin")) {
          addNotification("error", "You don't have permission for this action");
        } else {
          addNotification("error", error.message || "Socket error occurred");
        }
      });

      socketIo.on("auctionData", (data) => {
        console.log("Received auctionData:", data);
        setLiveAuctions((prev) => {
          const normalizedAuctionId = normalizeId(data._id || data.auctionId);
          if (!normalizedAuctionId) return prev;
          const exists = prev.find((a) => normalizeId(a.id) === normalizedAuctionId);
          return exists
            ? prev.map((a) =>
                normalizeId(a.id) === normalizedAuctionId
                  ? { ...a, ...data, id: normalizedAuctionId }
                  : a
              )
            : [...prev, { ...data, id: normalizedAuctionId }];
        });
      });

      socketIo.on("auctionMessage", ({ auctionId, message, sender, timestamp, type }) => {
        console.log("Received auctionMessage:", { auctionId, message, sender, timestamp, type });
        
        // Update live auctions with the new message
        setLiveAuctions((prev) =>
          prev.map((auction) =>
            normalizeId(auction.id) === normalizeId(auctionId)
              ? {
                  ...auction,
                  messages: [
                    ...(auction.messages || []),
                    {
                      message,
                      sender,
                      timestamp,
                      type: type || "message"
                    }
                  ]
                }
              : auction
          )
        );

        // Show notification for new messages
        if (type === "admin_message" || type === "clerk_message") {
          const senderName = sender?.name || (type === "admin_message" ? "Admin" : "Clerk");
          addNotification("info", `New message from ${senderName}: ${message}`);
        }
      });

      socketIo.on("messageSent", ({ auctionId, message, timestamp, status }) => {
        if (status === "success") {
          console.log("Message sent successfully:", { auctionId, message, timestamp });
          addNotification("success", "Message sent successfully!");
        }
      });

      socketIo.on("bidUpdate", (data) => {
        console.log("Global bidUpdate received:", data);
        const auctionId = normalizeId(data.auctionId);
        setLiveAuctions((prev) =>
          prev.map((auction) =>
            normalizeId(auction.id) === auctionId
              ? {
                  ...auction,
                  currentBid: data.bidAmount,
                  currentBidder: data.bidderId,
                  minBidIncrement: data.minBidIncrement,
                  bids: data.bids || [
                    ...(auction.bids || []),
                    {
                      bidder: data.bidderId,
                      bidAmount: data.bidAmount,
                      bidTime: data.timestamp || new Date(),
                      bidType: data.bidType,
                    },
                  ],
                }
              : auction
          )
        );
      });

      socketIo.on("watcherUpdate", ({ auctionId, watchers }) => {
        console.log("Received watcherUpdate:", { auctionId, watchers });
        setLiveAuctions((prev) =>
          prev.map((auction) =>
            normalizeId(auction.id) === normalizeId(auctionId)
              ? { ...auction, watchers }
              : auction
          )
        );
      });

      socketIo.on("auctionModeUpdate", ({ auctionId, mode }) => {
        console.log(`Received auctionModeUpdate for auction ${auctionId}: ${mode}`);
        setAuctionModes((prev) => ({
          ...prev,
          [normalizeId(auctionId)]: mode,
        }));
      });

      socketIo.on("latestBidRemoved", ({ auctionId, removedBid, updatedBids, currentBid, currentBidder }) => {
        console.log("Received latestBidRemoved:", { auctionId, removedBid, updatedBids, currentBid, currentBidder });
        setLiveAuctions((prev) =>
          prev.map((auction) =>
            normalizeId(auction.id) === normalizeId(auctionId)
              ? {
                  ...auction,
                  currentBid,
                  currentBidder,
                  bids: updatedBids,
                }
              : auction
          )
        );
        addNotification("warning", "Latest bid has been removed.");
      });

      return () => {
        if (socketIo) {
          console.log("Cleaning up socket connection");
          socketIo.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
      };
    };

    initializeSocket();
  }, [userId, token, userRole, permissions, addNotification]);

  useEffect(() => {
    if (socket) {
      socket.on("auctionData", (data) => {
        const normalizedAuctionId = normalizeId(data._id || data.auctionId);
        if (normalizedAuctionId) {
          console.log("Received auction data for:", normalizedAuctionId);
        }
      });

      socket.on("joinAuction", ({ auctionId }) => {
        console.log("Joined auction:", auctionId);
      });
    }

    return () => {
      if (socket) {
        socket.off("auctionData");
        socket.off("joinAuction");
      }
    };
  }, [socket]);

  const subscribeToEvents = useCallback((auctionId, callbacks) => {
    if (!socket || !auctionId) return () => {};

    const normalizedAuctionId = normalizeId(auctionId);

    const handlers = {
      onBidUpdate: callbacks.onBidUpdate || (() => {}),
      onAuctionMessage: callbacks.onAuctionMessage || (() => {}),
      onWatcherUpdate: callbacks.onWatcherUpdate || (() => {}),
      onLatestBidRemoved: callbacks.onLatestBidRemoved || (() => {}),
      onAuctionModeUpdate: callbacks.onAuctionModeUpdate || (() => {}),
    };

    const bidUpdateHandler = (data) => {
      const msgAuctionId = normalizeId(data.auctionId);
      if (msgAuctionId === normalizedAuctionId) {
        console.log(`Received bid update for auction ${msgAuctionId}:`, data);
        handlers.onBidUpdate(data);

        setLiveAuctions((prev) =>
          prev.map((auction) => {
            if (normalizeId(auction.id) !== msgAuctionId) return auction;

            const bidTime = new Date(data.timestamp || new Date()).getTime();
            const hasDuplicate = (auction.bids || []).some((existingBid) => {
              const existingTime = new Date(existingBid.bidTime).getTime();
              return (
                existingBid.bidAmount === data.bidAmount &&
                Math.abs(existingTime - bidTime) < 1000
              );
            });

            const updatedBids = hasDuplicate
              ? auction.bids
              : [
                  ...(auction.bids || []),
                  {
                    bidder: data.bidderId,
                    bidAmount: data.bidAmount,
                    bidTime: data.timestamp || new Date(),
                    bidType: data.bidType,
                  },
                ];

            return {
              ...auction,
              currentBid: data.bidAmount,
              currentBidder: data.bidderId,
              minBidIncrement: data.minBidIncrement,
              bids: updatedBids,
            };
          })
        );
      }
    };

    const auctionMessageHandler = ({ auctionId: msgAuctionId, message, actionType, sender, timestamp, bidType }) => {
      const normalizedMsgAuctionId = normalizeId(msgAuctionId);
      if (normalizedMsgAuctionId === normalizedAuctionId) {
        handlers.onAuctionMessage({
          auctionId: normalizedMsgAuctionId,
          message,
          actionType,
          sender,
          timestamp,
          bidType,
        });
      }
    };

    const watcherUpdateHandler = ({ auctionId: msgAuctionId, watchers }) => {
      const normalizedMsgAuctionId = normalizeId(msgAuctionId);
      if (normalizedMsgAuctionId === normalizedAuctionId) {
        handlers.onWatcherUpdate({
          auctionId: normalizedMsgAuctionId,
          watchers,
        });
      }
    };

    const latestBidRemovedHandler = ({ auctionId: msgAuctionId, removedBid, updatedBids, currentBid, currentBidder }) => {
      const normalizedMsgAuctionId = normalizeId(msgAuctionId);
      if (normalizedMsgAuctionId === normalizedAuctionId) {
        handlers.onLatestBidRemoved({
          auctionId: normalizedMsgAuctionId,
          removedBid,
          updatedBids,
          currentBid,
          currentBidder,
        });
      }
    };

    const auctionModeUpdateHandler = ({ auctionId: msgAuctionId, mode }) => {
      const normalizedMsgAuctionId = normalizeId(msgAuctionId);
      if (normalizedMsgAuctionId === normalizedAuctionId) {
        handlers.onAuctionModeUpdate({
          auctionId: normalizedMsgAuctionId,
          mode,
        });
        setAuctionModes((prev) => ({
          ...prev,
          [normalizedMsgAuctionId]: mode,
        }));
      }
    };

    socket.on("bidUpdate", bidUpdateHandler);
    socket.on("auctionMessage", auctionMessageHandler);
    socket.on("watcherUpdate", watcherUpdateHandler);
    socket.on("latestBidRemoved", latestBidRemovedHandler);
    socket.on("auctionModeUpdate", auctionModeUpdateHandler);

    return () => {
      socket.off("bidUpdate", bidUpdateHandler);
      socket.off("auctionMessage", auctionMessageHandler);
      socket.off("watcherUpdate", watcherUpdateHandler);
      socket.off("latestBidRemoved", latestBidRemovedHandler);
      socket.off("auctionModeUpdate", auctionModeUpdateHandler);
    };
  }, [socket, setLiveAuctions]);

  useEffect(() => {
    if (socket && userRole) {
      console.log("Role changed to:", userRole);
      socket.emit("updateRole", { role: userRole });
    }
  }, [socket, userRole]);

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
    isConnected,
    subscribeToEvents,
  };
};