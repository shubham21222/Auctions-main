import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { 
        type: Number, 
        required: true,
        validate: {
            validator: function(value) {
                return value > this.currentBid;
            },
            message: "Bid amount must be greater than the current bid."
        }
    },
    bidTime: { type: Date, default: Date.now },
    paid: { type: Boolean, default: false }, // Tracks payment status
});

const auctionSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, required: true },
    currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track paid users
    startDate: { type: Date, default: Date.now },
    endDate: { 
        type: Date, 
        required: true
    },
    bids: [bidSchema],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winnerBidTime: { type: Date },
    minBidIncrement: { type: Number, default: 10 }, // Optional
    lotNumber: { type: String }, // Optional
    status: { type: String, enum: ["ACTIVE", "ENDED"], default: "ACTIVE" },
    auctionType: { type: String, enum: ["LIVE", "TIMED"], default: "TIMED" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true
});

// Ensure currentBid starts at startingBid
auctionSchema.pre("save", function (next) {
    if (this.isNew) {
        this.currentBid = this.startingBid;
    }

    next();
});

export default mongoose.model("Auction", auctionSchema);
