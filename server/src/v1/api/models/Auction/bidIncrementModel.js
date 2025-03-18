import mongoose from "mongoose";


const bidIncrementSchema = new mongoose.Schema({
    price: { type: Number, required: true, unique: true }, // Starting price
    increment: { type: Number, required: true } // Increment value
},
{
    timestamps: true,
})

export default mongoose.model("BidIncrement", bidIncrementSchema);