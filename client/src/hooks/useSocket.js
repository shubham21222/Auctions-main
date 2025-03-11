"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [userCache, setUserCache] = useState({}); // Cache for user data
  const [auctionCache, setAuctionCache] = useState({}); // Cache for auction data
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);

  // Fetch user data by ID
  const fetchUserName = useCallback(
    async (id) => {
      if (!token || !id) return id;
      if (userCache[id]) return userCache[id];

      try {
        const response = await fetch(`https://bid.nyelizabeth.com/v1/api/auth/getUserById/${id}`, {
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        const userName = data.items?.name || id;
        setUserCache((prev) => ({ ...prev, [id]: userName }));
        return userName;
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error.message);
        return id;
      }
    },
    [token, userCache]
  );

  // Fetch auction title by ID
  const fetchAuctionTitle = useCallback(
    async (id) => {
      if (!token || !id) return id;
      if (auctionCache[id]) return auctionCache[id];

      try {
        const response = await fetch(`https://bid.nyelizabeth.com/v1/api/auction/getbyId/${id}`, {
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch auction");
        const data = await response.json();
        const auctionTitle = data.items?.product?.title || id;
        setAuctionCache((prev) => ({ ...prev, [id]: auctionTitle }));
        return auctionTitle;
      } catch (error) {
        console.error(`Error fetching auction ${id}:`, error.message);
        return id;
      }
    },
    [token, auctionCache]
  );

  // Add notification with type and message
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

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

    socket.on("bidUpdate", async ({ auctionId, bidAmount, userId: bidderId }) => {
      console.log("Received bidUpdate:", { auctionId, bidAmount, bidderId });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, currentBid: bidAmount, currentBidder: bidderId }
            : auction
        )
      );
      const bidderName = await fetchUserName(bidderId);
      const auctionTitle = await fetchAuctionTitle(auctionId);
      if (bidderId !== userId) {
        addNotification("success", `New bid on ${auctionTitle}: $${bidAmount} by ${bidderName}`);
      }
    });

    socket.on("auctionEnded", async ({ auctionId, winner }) => {
      console.log("Received auctionEnded:", { auctionId, winner });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, status: "ENDED", winner: winner || null }
            : auction
        ).filter((auction) => auction.status !== "ENDED")
      );
      const winnerName = winner ? await fetchUserName(winner) : "N/A";
      const auctionTitle = await fetchAuctionTitle(auctionId);
      addNotification("info", `${auctionTitle} has ended. Winner: ${winnerName}`);
    });

    socket.on("watcherUpdate", async ({ auctionId, watchers }) => {
      console.log("Received watcherUpdate:", { auctionId, watchers });
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId ? { ...auction, watchers } : auction
        )
      );
      const auctionTitle = await fetchAuctionTitle(auctionId);
      addNotification("info", `${watchers} users are watching ${auctionTitle}`);
    });

    socket.on("outbidNotification", async ({ message, auctionId }) => {
      console.log("Received outbidNotification:", { message, auctionId });
      const auctionTitle = await fetchAuctionTitle(auctionId);
      addNotification("error", `${message} on ${auctionTitle}`);
    });

    socket.on("winnerNotification", async ({ message, auctionId, finalBid }) => {
      console.log("Received winnerNotification:", { message, auctionId, finalBid });
      const auctionTitle = await fetchAuctionTitle(auctionId);
      addNotification("success", `${message} ${auctionTitle} - Final Bid: $${finalBid}`);
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
  }, [socket, isMounted, userId, fetchUserName, fetchAuctionTitle]);

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