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

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auctionModes, setAuctionModes] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const role = useSelector((state) => state.auth.role);

  const isEffectiveAdmin = isAdmin || role === "clerk";

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      5000
    );
  }, []);

  const updateAuctionMode = useCallback(
    (auctionId, mode) => {
      if (socket && auctionId && mode) {
        socket.emit("setAuctionMode", {
          auctionId: normalizeId(auctionId),
          mode,
          userId,
          isAdmin: isEffectiveAdmin,
        });
        console.log(`Set auction ${auctionId} mode to: ${mode}`);
        setAuctionModes((prev) => ({
          ...prev,
          [normalizeId(auctionId)]: mode,
        }));
      }
    },
    [socket, userId, isEffectiveAdmin]
  );

  const joinAuction = useCallback(
    (auctionId) => {
      if (socket && auctionId) {
        socket.emit("joinAuction", { auctionId: normalizeId(auctionId) });
        console.log(`Joined auction room: ${auctionId}`);
      }
    },
    [socket]
  );

  const getAuctionData = useCallback(
    (auctionId) => {
      return new Promise((resolve, reject) => {
        if (!socket || !auctionId) {
          reject(new Error("Socket or auctionId not available"));
          return;
        }

        if (!socket.connected) {
          socket.connect();
          console.log("Socket was disconnected, attempting to reconnect...");
        }

        socket.emit("getAuctionData", { auctionId: normalizeId(auctionId) });
        console.log(`Requested auction data for: ${auctionId}`);

        const onAuctionData = (data) => {
          if (
            normalizeId(data._id) === normalizeId(auctionId) ||
            normalizeId(data.auctionId) === normalizeId(auctionId)
          ) {
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
    },
    [socket]
  );

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
      if (!socket || !auctionId) {
        toast.error("Socket or auction ID not available");
        console.log("placeBid failed: Socket or auctionId missing");
        return false;
      }

      try {
        const auctionData = await getAuctionData(auctionId);
        console.log("Auction data fetched for bid:", auctionData);
        const currentMode =
          auctionModes[normalizeId(auctionId)] || "competitor";

        if (bidType === "competitor" && currentMode !== "competitor") {
          addNotification(
            "error",
            "Auction is not in competitor mode. Switching mode..."
          );
          updateAuctionMode(auctionId, "competitor");
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        console.log(
          `Emitting placeBid for auction ${auctionId}: $${bidAmount} (${bidType})`
        );
        socket.emit("placeBid", {
          auctionId: normalizeId(auctionId),
          userId,
          bidType,
          bidAmount,
          isAdmin: isEffectiveAdmin,
        });

        console.log(
          `placeBid succeeded for auction ${auctionId}: $${bidAmount} (waiting for bidUpdate)`
        );
        return true;
      } catch (error) {
        console.error(`placeBid error for auction ${auctionId}:`, error);
        addNotification("error", `Failed to place bid: ${error.message}`);
        return false;
      }
    },
    [
      socket,
      userId,
      auctionModes,
      getAuctionData,
      addNotification,
      updateAuctionMode,
      isEffectiveAdmin,
    ]
  );

  const sendMessage = useCallback(
    (auctionId, message) => {
      if (socket && auctionId && message) {
        socket.emit("sendMessage", {
          auctionId: normalizeId(auctionId),
          message,
          userId,
          isAdmin: isEffectiveAdmin,
        });
        console.log(`Sent message to auction ${auctionId}: ${message}`);
      }
    },
    [socket, userId, isEffectiveAdmin]
  );

  const performAdminAction = useCallback(
    (auctionId, actionType) => {
      if (socket && auctionId && actionType) {
        socket.emit("adminAction", {
          auctionId: normalizeId(auctionId),
          actionType,
          userId,
          isAdmin: isEffectiveAdmin,
        });
        console.log(
          `Performed admin action ${actionType} on auction ${auctionId}`
        );
      }
    },
    [socket, userId, isEffectiveAdmin]
  );

  const performClerkAction = useCallback(
    (auctionId, actionType) => {
      if (socket && auctionId && actionType) {
        socket.emit("clerkAction", {
          auctionId: normalizeId(auctionId),
          actionType,
          userId,
          isClerk: role === "clerk",
        });
        console.log(
          `Performed clerk action ${actionType} on auction ${auctionId}`
        );
      }
    },
    [socket, userId, role]
  );

  useEffect(() => {
    let socketIo = null;

    const initializeSocket = () => {
      if (!userId || !token || socket) return;

      socketIo = io(config.baseURL, {
        query: { userId },
        auth: { token, isAdmin: isEffectiveAdmin },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketIo.on("connect", () => {
        console.log("Socket connected with ID:", socketIo.id);
        setSocket(socketIo);
        setIsConnected(true);
        addNotification("success", "Connected to auction server!");
      });

      socketIo.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
        if (
          reason === "io server disconnect" ||
          reason === "io client disconnect"
        ) {
          setSocket(null);
        }
        addNotification("warning", "Disconnected from server. Reconnecting...");
      });

      socketIo.on("reconnect", (attempt) => {
        console.log(
          "Reconnected to Socket.IO server after",
          attempt,
          "attempts"
        );
        setIsConnected(true);
        addNotification("success", "Reconnected to auction server!");
      });

      socketIo.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        toast.error(`Socket connection error: ${error.message}`);
        addNotification("error", `Connection failed: ${error.message}`);
      });

      socketIo.on("auctionData", (data) => {
        console.log("Received auctionData:", data);
        setLiveAuctions((prev) => {
          const normalizedAuctionId = normalizeId(data._id || data.auctionId);
          if (!normalizedAuctionId) return prev;
          const exists = prev.find(
            (a) => normalizeId(a.id) === normalizedAuctionId
          );
          return exists
            ? prev.map((a) =>
                normalizeId(a.id) === normalizedAuctionId
                  ? { ...a, ...data, id: normalizedAuctionId }
                  : a
              )
            : [...prev, { ...data, id: normalizedAuctionId }];
        });
      });

      socketIo.on(
        "auctionMessage",
        ({ auctionId, message, actionType, sender, timestamp, bidType, nextActiveAuction, nextAuctionProductName, nextAuctionCatalogName }) => {
          console.log("Received auctionMessage:", {
            auctionId,
            message,
            actionType,
            sender,
            timestamp,
            bidType,
            nextActiveAuction,
            nextAuctionProductName,
            nextAuctionCatalogName,
          });
          const displayMessage = message || actionType || "Update";
          addNotification("info", displayMessage);
          setLiveAuctions((prev) =>
            prev.map((auction) =>
              normalizeId(auction.id) === normalizeId(auctionId)
                ? {
                    ...auction,
                    messages: [
                      ...(auction.messages || []),
                      {
                        message: displayMessage,
                        actionType,
                        sender:
                          typeof sender === "object"
                            ? sender.name || "Admin"
                            : sender || "Admin",
                        timestamp: timestamp || new Date(),
                        bidType: bidType || "message",
                        nextActiveAuction,
                        nextAuctionProductName,
                        nextAuctionCatalogName,
                      },
                    ],
                  }
                : auction
            )
          );
        }
      );

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
        console.log(
          `Received auctionModeUpdate for auction ${auctionId}: ${mode}`
        );
        setAuctionModes((prev) => ({
          ...prev,
          [normalizeId(auctionId)]: mode,
        }));
      });

      socketIo.on(
        "latestBidRemoved",
        ({ auctionId, removedBid, updatedBids, currentBid, currentBidder }) => {
          console.log("Received latestBidRemoved:", {
            auctionId,
            removedBid,
            updatedBids,
            currentBid,
            currentBidder,
          });
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
        }
      );

      socketIo.on("bidAccepted", (data) => {
        console.log("Received bidAccepted:", data);
      });

      socketIo.on("bidRejected", (error) => {
        console.log("Received bidRejected:", error);
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

    const cleanup = initializeSocket();

    return cleanup;
  }, [userId, token, isEffectiveAdmin, addNotification]);

  useEffect(() => {
    const setDefaultMode = (auctionId) => {
      if (socket && auctionId && !auctionModes[normalizeId(auctionId)]) {
        updateAuctionMode(auctionId, "competitor");
      }
    };

    if (socket) {
      socket.on("auctionData", (data) => {
        const normalizedAuctionId = normalizeId(data._id || data.auctionId);
        if (normalizedAuctionId) {
          setDefaultMode(normalizedAuctionId);
        }
      });

      socket.on("joinAuction", ({ auctionId }) => {
        setDefaultMode(auctionId);
      });
    }

    return () => {
      if (socket) {
        socket.off("auctionData");
        socket.off("joinAuction");
      }
    };
  }, [socket, auctionModes, updateAuctionMode]);

  const subscribeToEvents = useCallback(
    (auctionId, callbacks) => {
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
        const normalizedMsgAuctionId = normalizeId(data.auctionId);
        if (normalizedMsgAuctionId === normalizedAuctionId) {
          handlers.onBidUpdate(data);
        }
      };

      const auctionMessageHandler = ({
        auctionId: msgAuctionId,
        message,
        actionType,
        sender,
        timestamp,
        bidType,
        nextActiveAuction,
        nextAuctionProductName,
        nextAuctionCatalogName,
      }) => {
        const normalizedMsgAuctionId = normalizeId(msgAuctionId);
        if (normalizedMsgAuctionId === normalizedAuctionId) {
          handlers.onAuctionMessage({
            auctionId: normalizedMsgAuctionId,
            message,
            actionType,
            sender,
            timestamp,
            bidType,
            nextActiveAuction,
            nextAuctionProductName,
            nextAuctionCatalogName,
          });
        }
      };

      const watcherUpdateHandler = ({ auctionId: msgAuctionId, watchers }) => {
        const normalizedMsgAuctionId = normalizeId(msgAuctionId);
        if (normalizedMsgAuctionId === normalizedAuctionId) {
          handlers.onWatcherUpdate({ auctionId: normalizedMsgAuctionId, watchers });
        }
      };

      const latestBidRemovedHandler = ({
        auctionId: msgAuctionId,
        removedBid,
        updatedBids,
        currentBid,
        currentBidder,
      }) => {
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
    },
    [socket]
  );

  return {
    socket,
    liveAuctions,
    setLiveAuctions,
    notifications,
    joinAuction,
    getAuctionData,
    placeBid,
    getBidIncrement,
    sendMessage,
    performAdminAction,
    performClerkAction,
    updateAuctionMode,
    auctionModes,
    isConnected,
    subscribeToEvents,
  };
};