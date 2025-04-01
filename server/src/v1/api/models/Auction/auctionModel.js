import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { type: Number, required: true },
    bidTime: { type: Date, default: Date.now },
    ipAddress:{type:String, required: false, default:""},
    paid: { type: Boolean, default: false }, // Tracks payment status
    Role:{ type: String},
});

const auctionSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false , default: null },
        auctionProduct:{type: mongoose.Schema.Types.ObjectId, ref: "AuctionProduct", required:false, default: null},
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false, default: null},
        auctioncategory:{type: mongoose.Schema.Types.ObjectId , ref: "AunctionCategory", required:false, default: null},
        description: { type: String, required: false },
        startingBid: { type: Number, required: true },
        currentBid: { type: Number, required: true },
        currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track paid users
        startDate: { type: Date, default: Date.now, required: true },
        endDate: { type: Date, required: false , default:null },
        bids: [bidSchema],
        winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        winnerBidTime: { type: Date },
        minBidIncrement: { type: Number, default: 0 }, // Optional
        lotNumber: { type: String }, // Ensure unique LOT numbers
        status: { type: String, enum: ["ACTIVE", "ENDED"], default: "ACTIVE" },
        auctionType: { type: String, enum: ["LIVE", "TIMED"], default: "TIMED" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        Emailsend:{type:String , enum:['true' , 'false'] , default:'false'},
        payment_status: { type: String, enum:['PAID' , 'UNPAID' , 'PENDING' , 'FAILED'] , default:'UNPAID'},
        shipping_status:{type:String , enum:['SHIPPED' , 'DELIVERED' , 'CANCELED' , 'RETURNED' , 'FAILED' , 'PENDING'] , default:'PENDING'},
        catalog: { type: String , required: false },
    },
    {
        timestamps: true,
    }
);

// Ensure `currentBid` starts at `startingBid` only when the auction is first created
auctionSchema.pre("save", function (next) {
    if (this.isNew && !this.currentBid) {
        this.currentBid = this.startingBid;
    }
    next();
});

// Ensure `endDate` is greater than `startDate`
// auctionSchema.pre("validate", function (next) {
//     if (this.endDate <= this.startDate) {
//         return next(new Error("End date must be later than start date."));
//     }
//     next();
// });

// Set winner when auction ends
// auctionSchema.methods.setWinner = async function () {
//     if (this.status == "ENDED") return; // Avoid redundant updates
//     if (this.bids.length == 0) {
//         this.status = "ENDED";
//         return;
//     }

    // const highestBid = this.bids.reduce((max, bid) => (bid.bidAmount > max.bidAmount ? bid : max), this.bids[0]);
    // this.winner = highestBid.bidder;
    // this.winnerBidTime = highestBid.bidTime;
    // this.status = "ENDED";

    // await this.save();
// };

export default mongoose.model("Auction", auctionSchema);
