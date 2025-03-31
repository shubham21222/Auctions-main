import { Server } from "socket.io";
import Auction from "../models/Auction/auctionModel.js";
import bidIncrementModel from "../models/Auction/bidIncrementModel.js";
import mongoose from "mongoose";
// import User from "../models/User/userModel.js";
import User from "../models/Auth/User.js"

const userSocketMap = {};
const auctionWatchers = {};
const auctionModes = {};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://bid.nyelizabeth.com"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
    }

    socket.on("setAuctionMode", async ({ auctionId, mode, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user || user.role !== "ADMIN") {
          return socket.emit("error", { message: "Unauthorized: Only admins can set auction mode." });
        }

        const auction = await Auction.findById(auctionId);
        if (!auction) {
          return socket.emit("error", { message: "Auction not found." });
        }

        auctionModes[auctionId] = mode;
        console.log(`Auction ${auctionId} mode set to: ${mode}`);

        // Broadcast to all clients in the auction room, including the sender
        io.to(auctionId).emit("auctionModeUpdate", { auctionId, mode });
      } catch (error) {
        console.error("Error setting auction mode:", error);
        socket.emit("error", { message: "Failed to set auction mode." });
      }
    });

    socket.on("sendMessage", async ({ auctionId, message, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return socket.emit("error", { message: "User not found." });
        }
        if (user.role !== "ADMIN") {
          return socket.emit("error", { message: "Unauthorized: Only admins can send messages." });
        }

        io.to(auctionId).emit("auctionMessage", {
          auctionId,
          message,
          sender: {
            id: userId,
            name: user.name,
            role: user.role,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    socket.on("adminAction", async ({ auctionId, actionType, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user || user.role !== "ADMIN") {
          return socket.emit("error", { message: "Unauthorized: Only admins can perform actions." });
        }

        io.to(auctionId).emit("auctionMessage", {
          auctionId,
          actionType,
          sender: {
            id: userId,
            name: user.name,
            role: user.role,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error processing admin action:", error);
        socket.emit("error", { message: "Failed to process admin action." });
      }
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

        if (auctionModes[auctionId]) {
          socket.emit("auctionModeUpdate", { auctionId, mode: auctionModes[auctionId] });
        }
      } catch (error) {
        console.error("Error joining auction:", error);
      }
    });

    socket.on("placeBid", async ({ auctionId, userId: bidderId, bidType }) => {
      try {
        const auction = await Auction.findById(auctionId).populate("bids");
        if (!auction || auction.status === "ENDED") {
          return socket.emit("error", { message: "Auction not active." });
        }

        const user = await User.findById(bidderId);
        if (!user) {
          return socket.emit("error", { message: "User not found." });
        }

        if (bidType === "competitor" && user.role !== "ADMIN") {
          return socket.emit("error", { message: "Only admins can place competitor bids." });
        }
        if (bidType === "online" && user.role === "ADMIN") {
          return socket.emit("error", { message: "Admins cannot place online bids." });
        }

        const currentMode = auctionModes[auctionId] || "online";
        if (bidType === "competitor" && currentMode !== "competitor") {
          return socket.emit("error", { message: "Auction is not in competitor bid mode." });
        }
        if (bidType === "online" && currentMode !== "online") {
          return socket.emit("error", { message: "Auction is not in online bid mode." });
        }

        let ipAddress = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
        if (ipAddress.includes(",")) {
          ipAddress = ipAddress.split(",")[0].trim();
        }
        if (ipAddress.startsWith("::ffff:")) {
          ipAddress = ipAddress.split(":").pop();
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
        const bidAmount = currentBid + bidIncrement;

        const bidRule = await bidIncrementModel
          .findOne({ price: { $lte: bidAmount } })
          .sort({ price: -1 });
        const requiredIncrement = bidRule ? bidRule.increment : bidIncrement;

        const finalBidAmount = currentBid + requiredIncrement;

        auction.bids.push({
          bidder: bidderId,
          bidAmount: finalBidAmount,
          bidTime: new Date(),
          ipAddress: ipAddress,
          bidType: bidType || "online",
          Role:user.role
        });
        auction.currentBid = finalBidAmount;
        auction.currentBidder = bidderId;
        auction.minBidIncrement = requiredIncrement;
        await auction.save();

        console.log(
          `Bid placed: ${finalBidAmount} by ${bidderId} on auction ${auctionId} (Type: ${bidType || "online"})`
        );
        io.in(auctionId).emit("bidUpdate", {
          auctionId,
          bidAmount: finalBidAmount,
          bidderId,
          minBidIncrement: auction.minBidIncrement,
          bids: auction.bids,
          bidType: bidType || "online",
          Role: user.role
        });

        const lastBidderId =
          auction.bids.length > 1 ? auction.bids[auction.bids.length - 2].bidder : null;
        if (lastBidderId && lastBidderId.toString() !== bidderId) {
          const lastBidderSocketId = userSocketMap[lastBidderId];
          if (lastBidderSocketId) {
            console.log(`Notifying outbid user ${lastBidderId} at socket ${lastBidderSocketId}`);
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