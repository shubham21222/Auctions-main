import { Server } from "socket.io";
import Auction from "../models/Auction/auctionModel.js";
import bidIncrementModel from "../models/Auction/bidIncrementModel.js";
import mongoose from "mongoose";

const userSocketMap = {};
const auctionWatchers = {};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://bid.nyelizabeth.com"], // Ensure this matches your frontend
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
    }

        // 🎯 **Admin sending auction messages**
        socket.on("adminAction", ({ auctionId, actionType }) => {
          console.log(`Admin Action: ${actionType} for Auction ${auctionId}`);
    
          // Send message to all users in this auction
          io.to(auctionId).emit("auctionMessage", { auctionId, actionType });
        });



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

        const bidRule = await bidIncrementModel.findOne({price:{ $lte: bidAmount }}).sort({price: -1});
        if (bidRule && bidAmount < auction.currentBid + bidRule.increment) {
          return socket.emit("error", {
            message: `Bid must be at least $${auction.currentBid + bidRule.increment}.`,
          });
        }

        const requiredBid = auction.currentBid + bidRule.increment;
        if (bidAmount < requiredBid) {
          return socket.emit("error", {
            message: `Bid must be at least $${requiredBid}.`,
          });
        }

        auction.bids.push({
          bidder: userId,
          bidAmount,
          bidTime: new Date(),
        });

        auction.currentBid = bidAmount;
        auction.minBidIncrement = bidRule.increment;
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

    // Inside initializeSocket
socket.on("sendMessage", async ({ auctionId, message }) => {
  try {
    console.log(`Admin sent message for Auction ${auctionId}: ${message}`);
    // Broadcast the message to all users in the auction room
    io.to(auctionId).emit("auctionMessage", { auctionId, actionType: `MESSAGE: ${message}` });
  } catch (error) {
    console.error("Error sending message:", error);
    socket.emit("error", { message: "Failed to send message." });
  }
});

    socket.on("placeBid", async ({ auctionId, bidAmount, userId: bidderId }) => {
      try {
        const auction = await Auction.findById(auctionId).populate("bids");
        if (!auction || auction.status === "ENDED") {
          return socket.emit("error", { message: "Auction not active." });
        }
    
        const getBidIncrement = (currentBid) => {
          if (currentBid >= 1000000) return 50000;
          if (currentBid >= 500000) return 25000;
          if (currentBid >= 250000) return 10000;
          if (currentBid >= 100000) return 5000;
          if (currentBid >= 50000) return 2500;
          if (currentBid >= 25000) return 1000;
          if (currentBid >= 10000) return 500;
          if (currentBid >= 5000) return 250;
          if (currentBid >= 1000) return 100;
          if (currentBid >= 100) return 50;
          if (currentBid >= 50) return 10;
          if (currentBid >= 25) return 5;
          return 1;
        };
    
        const currentBid = auction.currentBid || 0;
        const bidIncrement = getBidIncrement(currentBid);
        const requiredBid = currentBid + bidIncrement;
    
        if (bidAmount < requiredBid) {
          return socket.emit("error", {
            message: `Bid must be at least $${requiredBid}.`,
          });
        }
    
        auction.bids.push({
          bidder: bidderId,
          bidAmount,
          bidTime: new Date(),
        });
        auction.currentBid = bidAmount;
        auction.currentBidder = bidderId;
        await auction.save();
    
        console.log(`Bid placed: ${bidAmount} by ${bidderId} on auction ${auctionId}`);
        io.in(auctionId).emit("bidUpdate", {
          auctionId,
          bidAmount,
          bidderId,
          bids: auction.bids,
        });
    
        const lastBidderId =
          auction.bids.length > 1 ? auction.bids[auction.bids.length - 2].bidder : null;
        if (lastBidderId && lastBidderId.toString() !== bidderId) {
          const lastBidderSocketId = userSocketMap[lastBidderId];
          if (lastBidderSocketId) {
            io.to(lastBidderSocketId).emit("outbidNotification", {
              message: "You've been outbid!",
              auctionId,
            });
          }
        }
      } catch (error) {
        console.error("Error placing bid:", error);
        socket.emit("error", { message: "Failed to place bid." });
      }
    });

     // 🎯 Fetch auction data by ID (Socket event)
     socket.on("getAuctionData", async ({ auctionId }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
          return socket.emit("auctionDataError", { message: "Invalid auction ID." });
        }

        const auction = await Auction.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(auctionId) } },
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "participants",
            },
          },
          {
            $lookup: {
              from: "bidincrements",
              let: { currentBid: "$currentBid" },
              pipeline: [
                { $match: { $expr: { $lte: ["$price", "$$currentBid"] } } },
                { $sort: { price: -1 } },
                { $limit: 1 },
              ],
              as: "bidIncrementRule",
            },
          },
          {
            $addFields: {
              minBidIncrement: {
                $ifNull: [{ $arrayElemAt: ["$bidIncrementRule.increment", 0] }, 0],
              },
            },
          },
          {
            $project: {
              product: {
                title: { $ifNull: ["$product.title", ""] },
                description: { $ifNull: ["$product.description", ""] },
                price: { $ifNull: ["$product.price", ""] },
                _id: { $ifNull: ["$product._id", ""] },
              },
              category: { _id: 1, name: 1 },
              startingBid: 1,
              currentBid: 1,
              currentBidder: 1,
              status: 1,
              startDate: 1,
              endDate: 1,
              createdBy: 1,
              winner: 1,
              minBidIncrement: 1,
              lotNumber: 1,
              bids: 1,
              winnerBidTime: 1,
              auctionType: 1,
              participants: {
                $map: {
                  input: "$participants",
                  as: "participant",
                  in: {
                    _id: { $ifNull: ["$$participant._id", ""] },
                    name: { $ifNull: ["$$participant.name", ""] },
                    email: { $ifNull: ["$$participant.email", ""] },
                  },
                },
              },
            },
          },
        ]);

        if (!auction.length) {
          return socket.emit("auctionDataError", { message: "Auction not found." });
        }

        console.log(`Auction data sent for ID: ${auctionId}`);
        socket.emit("auctionData", auction[0]);
      } catch (error) {
        console.error("Error fetching auction data:", error);
        socket.emit("auctionDataError", { message: "Internal server error." });
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