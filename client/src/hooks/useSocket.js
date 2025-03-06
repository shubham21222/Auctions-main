"use client";

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const userId = useSelector((state) => state.auth._id);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!userId || !token) return;

    const socketIo = io("https://bid.nyelizabeth.com/", {
      query: { userId },
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to Socket.IO server:", socketIo.id);
    });

    socketIo.on("bidUpdate", ({ auctionId, bidAmount, userId: bidderId }) => {
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, currentBid: bidAmount, currentBidder: bidderId }
            : auction
        )
      );
    });

    socketIo.on("auctionEnded", ({ auctionId, winner }) => {
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, status: "ENDED", winner: winner || null }
            : auction
        ).filter((auction) => auction.status !== "ENDED")
      );
    });

    socketIo.on("watcherUpdate", ({ auctionId, watchers }) => {
      setLiveAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId ? { ...auction, watchers } : auction
        )
      );
    });

    socketIo.on("error", ({ message }) => {
      console.error("Socket error:", message);
    });

    return () => {
      socketIo.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, [userId, token]);

  const joinAuction = useCallback((auctionId) => {
    if (socket && auctionId) {
      socket.emit("joinAuction", { auctionId });
      console.log(`Joined auction room: ${auctionId}`);
    }
  }, [socket]);

  return { socket, liveAuctions, setLiveAuctions, joinAuction };
};













// "use client";

// import { useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import { useSelector } from "react-redux";
// import config from "@/app/config_BASE_URL";

// export const useSocket = () => {
//   const [socket, setSocket] = useState(null);
//   const [liveAuctions, setLiveAuctions] = useState([]);
//   const userId = useSelector((state) => state.auth._id);
//   const token = useSelector((state) => state.auth.token);

//   useEffect(() => {
//     if (!userId || !token) return;

//     const socketIo = io(config.baseURL, {
//       query: { userId },
//       auth: { token },
//       transports: ["websocket"],
//     });

//     setSocket(socketIo);

//     socketIo.on("connect", () => {
//       console.log("Connected to Socket.IO server:", socketIo.id);
//     });

//     socketIo.on("bidUpdate", ({ auctionId, bidAmount, userId: bidderId }) => {
//       setLiveAuctions((prev) =>
//         prev.map((auction) =>
//           auction.id === auctionId
//             ? { ...auction, currentBid: bidAmount, currentBidder: bidderId }
//             : auction
//         )
//       );
//     });

//     socketIo.on("auctionEnded", ({ auctionId, winner }) => {
//       setLiveAuctions((prev) =>
//         prev.map((auction) =>
//           auction.id === auctionId
//             ? { ...auction, status: "ENDED", winner: winner || null }
//             : auction
//         ).filter((auction) => auction.status !== "ENDED")
//       );
//     });

//     socketIo.on("watcherUpdate", ({ auctionId, watchers }) => {
//       setLiveAuctions((prev) =>
//         prev.map((auction) =>
//           auction.id === auctionId ? { ...auction, watchers } : auction
//         )
//       );
//     });

//     socketIo.on("error", ({ message }) => {
//       console.error("Socket error:", message);
//     });

//     return () => {
//       socketIo.disconnect();
//       console.log("Disconnected from Socket.IO server");
//     };
//   }, [userId, token]);

//   const joinAuction = (auctionId) => {
//     if (socket && auctionId) {
//       socket.emit("joinAuction", { auctionId });
//       console.log(`Joined auction room: ${auctionId}`);
//     }
//   };

//   return { socket, liveAuctions, setLiveAuctions, joinAuction };
// };