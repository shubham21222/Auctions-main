import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            Remark: {
                type: String,
                required: true,
                default: 1
            },
            Offer_Amount: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentIntentId: {
        type: String, // Stores the Stripe Payment Intent ID
        required: false
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "SUCCEEDED", "FAILED"],
        default: "PENDING"
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled" , "Pending"],
        default: "Pending"
    },

    client_secret:{
        type: String,
    },

    OrderId:{
     type:String,
     unique: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
},{
    timestamps:true
})


orderSchema.pre('save' , async function(next) {

    if (!this.OrderId) {
        const randomNum = Math.floor(1000000000 + Math.random() * 9000000000); // Generates a 10-digit random number
        this.OrderId = `#${randomNum}`;
    }
    next();
    
})





export default mongoose.model('Order' , orderSchema)