import { Server } from "socket.io";
import Auction from "../models/Auction/auctionModel.js";

const userSocketMap = {}; 
const auctionWatchers = {}; 

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["https://bid.nyelizabeth.com/"], // Allow frontend connection
            methods: ["GET", "POST" , "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
        }

        // **Join Auction Room**
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

        // **Place a Bid**
        socket.on("placeBid", async ({ auctionId, bidAmount, userId }) => {
            try {
                const auction = await Auction.findById(auctionId).populate("bids");
                if (!auction || auction.status == "ENDED") {
                    return socket.emit("error", { message: "Auction not active." });
                }

                // if (!auction.participants.includes(userId)) {
                //     return socket.emit("error", { message: "You must register for this auction before bidding." });
                // }

                if (bidAmount < auction.currentBid ) {
                    return socket.emit("error", { message: `Bid must be at least ${auction.currentBid} higher than the current bid.` });
                }

                auction.bids.push({
                    bidder: userId,
                    bidAmount,
                    bidTime: new Date(),
                });

                auction.currentBid = bidAmount;
                auction.currentBidder = userId;
                await auction.save();

                io.in(auctionId).emit("bidUpdate", {
                    auctionId,
                    bidAmount,
                    userId,
                });

                // Notify previous highest bidder (if applicable)
                const lastBidderId = auction.bids.length > 1 ? auction.bids[auction.bids.length - 2].bidder : null;
                if (lastBidderId && lastBidderId.toString() !== userId) {
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
            }
        });

        // **End Auction**
        socket.on("endAuction", async ({ auctionId }) => {
            try {
                const auction = await Auction.findById(auctionId);
                if (!auction || auction.status == "ENDED") return;

                if (auction.bids.length === 0) {
                    auction.status = "ENDED";
                    await auction.save();
                    return io.emit("auctionEnded", {
                        auctionId,
                        winner: null,
                        message: "Auction ended with no bids.",
                    });
                }

                // Determine the highest bidder
                const highestBid = auction.bids.reduce((max, bid) => (bid.bidAmount > max.bidAmount ? bid : max), auction.bids[0]);
                auction.winner = highestBid.bidder;
                auction.winnerBidTime = highestBid.bidTime;
                auction.status = "ENDED";
                await auction.save();

                io.emit("auctionEnded", {
                    auctionId,
                    winner: auction.winner,
                    message: `Auction has ended. Winner: ${auction.winner}`,
                });

                // Notify the winner privately
                if (userSocketMap[auction.winner]) {
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

        // **Leave auction room on disconnect**
        socket.on("disconnect", () => {
            if (userId) {
                console.log(`User ${userId} disconnected.`);
                delete userSocketMap[userId];

                // Remove from watchers
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

