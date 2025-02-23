import Order from "../../models/Order/order.js"
import User from "../../models/Auth/User.js"
import Product from "../../models/Products/product.model.js"
import stripe from "../../config/stripeConfig.js"
import {
    success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError
} from "../../../../../src/v1/api/formatters/globalResponse.js"


// create the Order Api //

export const createOrder = async(req,res)=>{
    try {

        const {products  , totalAmount} = req.body;
        const UserId = req.user._id;

        if(!products || products.length==0){
            return badRequest(400 , 'No Products in the Order')
        }

        // find the User from the Model //

        const user = await User.findById(UserId)
        if(!user){
            return badRequest(res , 'User not found')
        }


        
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Convert to cents
            currency:'usd',
            payment_method_types: ["card"],
            metadata: { 
                CustomerId: user._id.toString(),
                CustomerName: user.name || "",
                CustomerEmail: user.email || "",
                CustomerMobile: user.mobile,
                integration_check: "MakeOrder" },

        });


             // Create Order in Database

             const order = new Order({
                user:user.id,
                products: products.map(p => ({
                    product: p.product,
                    Remark: p.Remark,
                    Offer_Amount: p.Offer_Amount
                })),

             totalAmount:totalAmount,
             paymentIntentId: paymentIntent.id,
             paymentStatus: "PENDING"
             })

             const result = await order.save();
            //  return res.status(200 , {
            //     message: "Order created successfully",
            //     result,
            //     clientSecret: paymentIntent.client_secret 
            // })   
            
            return res.status(200).json({
                    message: "Order created successfully",
                result,
                clientSecret: paymentIntent.client_secret 
            })
            
    } catch (error) {
        console.log("error" , error)
       return res.status(500).json('Internal Server Error')
    }
}


// Called the webhook //


export const Orderwebhook = async(req,res)=>{

    const sig = req.headers["stripe-signature"];
    const endpointSecret = "whsec_rJ5wqkU5Pb49zRsd8qxMPrkDolhqTMal";
    if (!endpointSecret) {
        console.error("🚨 Missing Stripe Webhook Signature or Secret");
        return res.status(400).send("Webhook signature or secret missing.");
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`✅ Received Event: ${event.type}`);

    try {
        switch (event.type) {


            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                console.log(`💰 Payment successful: ${paymentIntent.id}`);

                if (paymentIntent.metadata?.CustomerId) {
                    const userId = ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await User.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    // Check if this payment was for an auction
                    if (paymentIntent.metadata.integration_check == "MakeOrder") {
                        console.log("🏆 Auction payment detected. Updating winner status.");
                    
                        const updatedOrder = await Order.findOneAndUpdate(
                            { user: userId },
                            {
                                $set: {
                                    paymentStatus: "SUCCEEDED"
                                },
                            },
                            { new: true } // This should be outside the $set
                        );
                    
                        console.log("✅ Updated User:", updatedOrder);
                    }
                }
                break;

            case "payment_intent.payment_failed":
                if (paymentIntent.metadata?.CustomerId) {
                    const userId = ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await User.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    // Check if this payment was for an auction
                    if (paymentIntent.metadata.integration_check == "MakeOrder") {
                        console.log("🏆 Auction payment detected. Updating winner status.");
                    
                        const updatedOrder = await Order.findOneAndUpdate(
                            { user: userId },
                            {
                                $set: {
                                    paymentStatus: "FAILED"
                                },
                            },
                            { new: true } // This should be outside the $set
                        );
                    
                        console.log("✅ Updated User:", updatedOrder);
                    }
                }
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("🚨 Webhook Processing Error:", error);
        return res.status(500).send("Internal Server Error.");
    }

}
