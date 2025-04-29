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
import { sendEmail } from "../../Utils/sendEmail.js"
import {generateEmailContent} from "../../Utils/generateEmailContent.js"
import { generateOrderPdfBuffer } from "../../config/generateOrderPdfBuffer.js"

import mongoose from "mongoose"
import { UnknownError } from "postmark/dist/client/errors/Errors.js"


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
             paymentStatus: "PENDING",
             client_secret:paymentIntent.client_secret || ""
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

// Get All Orders API //

export const getAllOrders = async (req, res) => {
    try {
        let { page = 1, limit = 100, search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const matchStage = {};

        if (search) {
            matchStage.$or = [
                { "userDetails.name": { $regex: search, $options: "i" } },
                { "userDetails.email": { $regex: search, $options: "i" } },
                { "productsDetails.name": { $regex: search, $options: "i" } },
                { OrderId: { $regex: search, $options: "i" } }
            ];
        }

        // Fetch orders with pagination
        const orders = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "productsDetails"
                }
            },
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    paymentStatus: 1,
                    OrderId: 1,
                    status: 1,
                    createdAt: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "productsDetails.name": 1,
                    "productsDetails.price": 1,
                    "productsDetails.title": 1,
                    "productsDetails.image": 1
                }
            }
        ]);

        // Count total documents after filtering
        const countAggregation = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "productsDetails"
                }
            },
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "PENDING"] }, 1, 0] }
                    },
                    succeededOrders: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "SUCCEEDED"] }, 1, 0] }
                    },
                    failedOrders: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "FAILED"] }, 1, 0] }
                    }
                }
            }
        ]);

        const totalOrdersData = countAggregation.length > 0 ? countAggregation[0] : {
            totalOrders: 0,
            pendingOrders: 0,
            succeededOrders: 0,
            failedOrders: 0
        };

        const totalPages = Math.ceil(totalOrdersData.totalOrders / limit);

        return res.status(200).json({
            message: "Orders fetched successfully",
            Orderdetails: totalOrdersData, // Total order count with status breakdown
            orders,
            pagination: {
                page,
                totalPages,
                totalOrders: totalOrdersData.totalOrders
            }
        });

    } catch (error) {
        console.log("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Update Order Status API //


export const getOrdersByUserId = async (req, res) => {
    try {
        let { page = 1, limit = 100, search = "" } = req.query;
        const { userId } = req.params;

        page = parseInt(page);
        limit = parseInt(limit);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const matchStage = { user: userObjectId };

        if (search) {
            matchStage.$or = [
                { "productsDetails.name": { $regex: search, $options: "i" } },
                { OrderId: { $regex: search, $options: "i" } }
            ];
        }

        // Fetch user-specific orders with pagination
        const orders = await Order.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "productsDetails"
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    paymentStatus: 1,
                    OrderId: 1,
                    status: 1,
                    createdAt: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "productsDetails.name": 1,
                    "productsDetails.price": 1,
                    "productsDetails.title": 1,
                    "productsDetails.image": 1
                }
            }
        ]);

        // Count total user orders and breakdown by status
        const countAggregation = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "PENDING"] }, 1, 0] }
                    },
                    succeededOrders: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "SUCCEEDED"] }, 1, 0] }
                    },
                    failedOrders: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "FAILED"] }, 1, 0] }
                    }
                }
            }
        ]);

        const totalOrdersData = countAggregation.length > 0 ? countAggregation[0] : {
            totalOrders: 0,
            pendingOrders: 0,
            succeededOrders: 0,
            failedOrders: 0
        };

        const totalPages = Math.ceil(totalOrdersData.totalOrders / limit);

        return res.status(200).json({
            message: "Orders fetched successfully",
            totalOrders: totalOrdersData,
            orders,
            pagination: {
                page,
                totalPages,
                totalOrders: totalOrdersData.totalOrders
            }
        });

    } catch (error) {
        console.error("🚨 Error fetching user orders:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Delete the orders //

export const deleteOrders = async (req, res) => {
    try {
        const { orderIds } = req.body; // Expecting an array of order _id's

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: "Please provide an array of order IDs" });
        }

        // Validate that all provided IDs are valid MongoDB ObjectIds
        const validOrderIds = orderIds.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validOrderIds.length === 0) {
            return res.status(400).json({ message: "No valid order IDs provided" });
        }

        // Delete orders
        const deleteResult = await Order.deleteMany({ _id: { $in: validOrderIds } });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: "No orders found to delete" });
        }

        return res.status(200).json({
            message: "Orders deleted successfully",
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error("🚨 Error deleting orders:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Update Orderstatus //

export const UpdateShipping = async (req, res) => {
    try {
      const { orderId, status } = req.body;
  
      if (!orderId) {
        return badRequest(res, "Order ID not provided.");
      }
  
      if (!status) {
        return badRequest(res, "Status is required.");
      }
  
      const order = await Order.findById(orderId);
      if (!order) {
        return badRequest(res, "Order not found.");
      }
  
      // Sanitize Offer_Amount values in products
      const sanitizedProducts = order.products.map((p) => ({
        ...p,
        Offer_Amount:
          typeof p.Offer_Amount === "string"
            ? Number(p.Offer_Amount.replace(/[^0-9.-]+/g, ""))
            : p.Offer_Amount,
      }));
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status,
          products: sanitizedProducts,
        },
        { new: true }
      );
  
      return success(res, "Order status updated successfully.", updatedOrder);
    } catch (error) {
      console.error("UpdateShipping Error:", error);
      return UnknownError(res, "Internal Server Error.");
    }
  };
  






export const updateOrderStatus = async (req, res) => {
    try {
        const {paymentStatus , _id } = req.body;


        if (!_id || !paymentStatus) {
            return badRequest(res, "Please provide order ID and payment status");
        }

        // Validate paymentStatus
        const validStatuses = ["PENDING", "SUCCEEDED", "FAILED", "CANCELLED", "REFUNDED"];
        if (!validStatuses.includes(paymentStatus)) {
            return badRequest(res, "Invalid payment status");
        }

        // Find and update the order
        const updatedOrder = await Order.findOneAndUpdate(
            { _id },  // Match using _id
            { $set: { paymentStatus } },
            { new: true } // Return the updated document
        );


        if (!updatedOrder) {
            return notFound(res, "Order not found");
        }

        if(paymentStatus === "SUCCEEDED"){
            const user  = await User.findById(updatedOrder.user)
            const products = await Product.find({_id: { $in: updatedOrder.products.map(product => product.product)}})
                // Send email to user

        if(user && user.email ){
              const emailContent = generateEmailContent(user, updatedOrder, products);

              const pdfBuffer = await generateOrderPdfBuffer(user, updatedOrder, products);

                await sendEmail({
                    to: user.email,
                    subject: 'Order Placed Successfully',
                    html: emailContent,
                    attachments: [
                        {
                            filename: `invoice-${updatedOrder.invoiceNumber || updatedOrder._id}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });
        }

        }
        

        return success(res, "Order status updated successfully", updatedOrder);
    } catch (error) {
        console.error("🚨 Error updating order status:", error);
        return unknownError(res, "Internal Server Error");
    }
};





// Called the webhook //


// export const Orderwebhook = async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const endpointSecret = "whsec_JPMQnOynsdQvQwNBE7nsZ5TDAMpdKzyP"; // Store in env for security

//     if (!endpointSecret) {
//         console.error("🚨 Missing Stripe Webhook Secret");
//         return res.status(400).send("Webhook secret missing.");
//     }

//     let event;
//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//         console.error("❌ Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log("✅ Webhook Full Event:", JSON.stringify(event, null, 2));

//     try {
//         switch (event.type) {
//             case "payment_intent.succeeded": {
//                 const paymentIntent = event.data.object;
//                 console.log(`💰 Payment successful: ${paymentIntent.id}`);

//                 // 🔥 Fetch full PaymentIntent details from Stripe
//                 const paymentIntents = await stripe.paymentIntents.retrieve(paymentIntent.id);

//                 console.log("✅ Retrieved PaymentIntent:", paymentIntents);

//                 // Update Order based on paymentIntentId
//                 const updatedOrder = await Order.findOneAndUpdate(
//                     { client_secret: paymentIntent.client_secret },
//                     {
//                         $set: {
//                             paymentStatus: "SUCCEEDED"
//                         },
//                     },
//                     { new: true }
//                 );

//                 if (!updatedOrder) {
//                     console.error("❌ Order not found for PaymentIntent:", paymentIntent.client_secret);
//                     return res.status(400).send("Order not found.");
//                 }

//                 console.log("✅ Order updated successfully:", updatedOrder);
//                 break;
//             }

//             case "payment_intent.payment_failed": {
//                 const paymentIntent = event.data.object;
//                 console.log(`❌ Payment failed: ${paymentIntent.id}`);

//                 // Update Order to failed status
//                 const updatedOrder = await Order.findOneAndUpdate(
//                     { client_secret: paymentIntent.client_secret },
//                     {
//                         $set: {
//                             paymentStatus: "FAILED"
//                         },
//                     },
//                     { new: true }
//                 );

//                 if (!updatedOrder) {
//                     console.error("❌ Order not found for PaymentIntent:", paymentIntent.client_secret);
//                     return res.status(400).send("Order not found.");
//                 }

//                 console.log("✅ Order updated successfully:", updatedOrder);
//                 break;
//             }

//             default:
//                 console.log(`⚠️ Unhandled event type: ${event.type}`);
//         }

//         res.json({ received: true });
//     } catch (error) {
//         console.error("🚨 Webhook Processing Error:", error);
//         return res.status(500).send("Internal Server Error.");
//     }
// };


export const Orderwebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = "whsec_JPMQnOynsdQvQwNBE7nsZ5TDAMpdKzyP"; // Store securely in env

    if (!endpointSecret) {
        console.error("🚨 Missing Stripe Webhook Secret");
        return res.status(400).send("Webhook secret missing.");
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Webhook Full Event:", JSON.stringify(event, null, 2));

    // Respond immediately to Stripe to prevent timeout errors
    res.json({ received: true });

    // Delay processing by 10 seconds
    setTimeout(async () => {
        try {
            switch (event.type) {
                case "payment_intent.succeeded": {
                    const paymentIntent = event.data.object;
                    console.log(`💰 Payment successful: ${paymentIntent.id}`);

                    const paymentIntents = await stripe.paymentIntents.retrieve(paymentIntent.id);
                    console.log("✅ Retrieved PaymentIntent:", paymentIntents);

                    const updatedOrder = await Order.findOneAndUpdate(
                        { client_secret: paymentIntent.client_secret },
                        { $set: { paymentStatus: "SUCCEEDED" } },
                        { new: true }
                    );

                    if (!updatedOrder) {
                        console.error("❌ Order not found for PaymentIntent:", paymentIntent.client_secret);
                    } else {
                        console.log("✅ Order updated successfully:", updatedOrder);
                    }
                    break;
                }

                case "payment_intent.payment_failed": {
                    const paymentIntent = event.data.object;
                    console.log(`❌ Payment failed: ${paymentIntent.id}`);

                    const updatedOrder = await Order.findOneAndUpdate(
                        { client_secret: paymentIntent.client_secret },
                        { $set: { paymentStatus: "FAILED" } },
                        { new: true }
                    );

                    if (!updatedOrder) {
                        console.error("❌ Order not found for PaymentIntent:", paymentIntent.client_secret);
                    } else {
                        console.log("✅ Order updated successfully:", updatedOrder);
                    }
                    break;
                }

                default:
                    console.log(`⚠️ Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            console.error("🚨 Webhook Processing Error:", error);
        }
    }, 10000); // 10-second delay
};

