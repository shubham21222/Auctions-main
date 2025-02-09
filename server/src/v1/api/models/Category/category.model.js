import mongoose from "mongoose";
import { Schema } from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a category name"],
        unique: true,
    },
    description: {
        type: String,
        false: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
},{
    timestamps: true
})


export default mongoose.model("Category", CategorySchema);