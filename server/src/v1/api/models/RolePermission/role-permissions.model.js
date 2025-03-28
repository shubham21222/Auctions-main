import mongoose from "mongoose";
import { Schema } from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    permissions: {
        type: [String],
        required: true,
        default: []
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps:true});

export default  mongoose.model('RolePermission', roleSchema);