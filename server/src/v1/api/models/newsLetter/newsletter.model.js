import mongoose from "mongoose";
const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: false,
        default: "",
    },
    lastName: {
        type: String,
        required: false,
        default: "",
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    },
}, {
    timestamps: true,
});


const newlettermodel = mongoose.model("Newsletter", newsletterSchema);
export default newlettermodel;