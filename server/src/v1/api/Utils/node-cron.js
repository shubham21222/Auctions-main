import cron from "node-cron";
import Auction from  "../models/Auction/auctionModel.js";

cron.schedule("*/1 * * * *", async () => {  // Runs every 1 minute
    try {
        console.log("Running auction expiry check...");
        const now = new Date();

        const expiredAuctions = await Auction.find({ 
            status: "ACTIVE", 
            endDate: { $lte: now } 
        });

        if (expiredAuctions.length > 0) {
            for (const auction of expiredAuctions) {
                auction.status = "ENDED";
                auction.winner = auction.currentBidder || null; // Avoid assigning null if no bids
                auction.winnerBidTime = new Date();
                await auction.save();
            }

            console.log(`✅ ${expiredAuctions.length} auctions ended.`);
        } else {
            console.log("✅ No expired auctions found.");
        }
    } catch (error) {
        console.error("❌ Error in cron job:", error);
    }
});
