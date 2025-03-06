import { Server } from "socket.io";
import Auction from "../models/Auction/auctionModel.js";

const userSocketMap = {};
const auctionWatchers = {};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://bid.nyelizabeth.com/"], // Ensure this matches your frontend
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
    }

    socket.on("joinAuction", async ({ auctionId }) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) {
          return socket.emit("error", { message: "Auction not found." });
        }

        socket.join(auctionId);
        console.log(`User ${userId} joined auction: ${auctionId}`);

        if (!auctionWatchers[auctionId]) {
          auctionWatchers[auctionId] = new Set();
        }
        auctionWatchers[auctionId].add(userId);

        io.in(auctionId).emit("watcherUpdate", {
          auctionId,
          watchers: auctionWatchers[auctionId].size,
        });
      } catch (error) {
        console.error("Error joining auction:", error);
      }
    });

    socket.on("placeBid", async ({ auctionId, bidAmount, userId }) => {
      try {
        const auction = await Auction.findById(auctionId).populate("bids");
        if (!auction || auction.status === "ENDED") {
          return socket.emit("error", { message: "Auction not active." });
        }

        if (bidAmount <= auction.currentBid) { // Fixed comparison
          return socket.emit("error", {
            message: `Bid must be higher than the current bid of $${auction.currentBid}.`,
          });
        }

        auction.bids.push({
          bidder: userId,
          bidAmount,
          bidTime: new Date(),
        });

        auction.currentBid = bidAmount;
        auction.currentBidder = userId;
        await auction.save();

        console.log(`Bid placed: ${bidAmount} by ${userId} on auction ${auctionId}`);
        io.in(auctionId).emit("bidUpdate", {
          auctionId,
          bidAmount,
          userId,
        });

        const lastBidderId =
          auction.bids.length > 1 ? auction.bids[auction.bids.length - 2].bidder : null;
        if (lastBidderId && lastBidderId.toString() !== userId) {
          const lastBidderSocketId = userSocketMap[lastBidderId];
          if (lastBidderSocketId) {
            console.log(`Notifying outbid user ${lastBidderId} at socket ${lastBidderSocketId}`);
            io.to(lastBidderSocketId).emit("outbidNotification", {
              message: "You've been outbid!",
              auctionId,
            });
          } else {
            console.log(`No socket found for outbid user ${lastBidderId}`);
          }
        }
      } catch (error) {
        console.error("Error placing bid:", error);
      }
    });

    socket.on("endAuction", async ({ auctionId }) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status === "ENDED") return;

        if (auction.bids.length === 0) {
          auction.status = "ENDED";
          await auction.save();
          console.log(`Auction ${auctionId} ended with no bids`);
          return io.emit("auctionEnded", {
            auctionId,
            winner: null,
            message: "Auction ended with no bids.",
          });
        }

        const highestBid = auction.bids.reduce(
          (max, bid) => (bid.bidAmount > max.bidAmount ? bid : max),
          auction.bids[0]
        );
        auction.winner = highestBid.bidder;
        auction.winnerBidTime = highestBid.bidTime;
        auction.status = "ENDED";
        await auction.save();

        console.log(`Auction ${auctionId} ended. Winner: ${auction.winner}`);
        io.emit("auctionEnded", {
          auctionId,
          winner: auction.winner,
          message: `Auction has ended. Winner: ${auction.winner}`,
        });

        if (userSocketMap[auction.winner]) {
          console.log(`Notifying winner ${auction.winner} at socket ${userSocketMap[auction.winner]}`);
          io.to(userSocketMap[auction.winner]).emit("winnerNotification", {
            message: "Congratulations! You won the auction.",
            auctionId,
            finalBid: auction.currentBid,
          });
        } else {
          console.log(`No socket found for winner ${auction.winner}`);
        }
      } catch (error) {
        console.error("Error ending auction:", error);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        console.log(`User ${userId} disconnected.`);
        delete userSocketMap[userId];

        for (let auctionId in auctionWatchers) {
          auctionWatchers[auctionId].delete(userId);
          io.in(auctionId).emit("watcherUpdate", {
            auctionId,
            watchers: auctionWatchers[auctionId].size,
          });
        }
      }
    });
  });

  return io;
};