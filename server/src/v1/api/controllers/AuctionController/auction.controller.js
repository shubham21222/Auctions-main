import auctionModel from "../../models/Auction/auctionModel.js"
import {formatAuctionDate} from "../../Utils/time-zone.js"
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
import {validateMongoDbId} from "../../Utils/validateMongodbId.js"
import productModel from "../../models/Products/product.model.js"
import categoryModel from "../../models/Category/category.model.js"
import UserModel from "../../models/Auth/User.js"
import stripe from "../../config/stripeConfig.js"
import mongoose from "mongoose"
import { response } from "express"
import { ObjectId } from "mongodb"
import dotenv from "dotenv"
dotenv.config()


//Geerate LOT //


const generateLotNumber = async () => {
    const lastAuction = await auctionModel.findOne().sort({ createdAt: -1 });  // Get last auction
    let lastLotNumber = lastAuction ? parseInt(lastAuction.lotNumber.split("#")[1]) : 0;
    return `LOT#${lastLotNumber + 1}`;
};

// create a new auction //

export const createAuction = async (req, res) => {
    try {
        const { product, startingBid, auctionType, endDate, startDate, createdBy, category , status } = req.body;

        if (!product || !startingBid || !auctionType || !startDate || !category) {
            return badRequest(res, "Please provide all required fields.");
        }

        // Fetch Product and Category simultaneously
        const [productExists, categoryExists] = await Promise.all([
            productModel.findById(product),
            categoryModel.findById(category)
        ]);

        if (!productExists) {
            return badRequest(res, "Product not found");
        }
        if (!categoryExists) {
            return badRequest(res, "Category not found");
        }



        // Generate LOT number
        const lotNumber = await generateLotNumber();

        if (auctionType == "TIMED" && !endDate) {
            return badRequest(res, "Timed auctions require an endDate.");
        }

        // Create new auction
        const auction = new auctionModel({
            product,
            category,
            startingBid,
            currentBid: startingBid,
            auctionType,
            endDate: auctionType == "TIMED" ? endDate : null,
            startDate,
            lotNumber,
            createdBy: req.user._id,
            status: status || "ACTIVE"
        });

        await auction.save();
        return created(res, "Auction created successfully.", auction);

    } catch (error) {
        console.error("Auction creation error:", error);
        return unknownError(res, error.message);
    }
};


// get all auctions //

export const getAuctions = async (req, res) => {
    try {
        const { 
            category, 
            status, 
            sortByPrice, 
            sortField, 
            sortOrder, 
            searchQuery, 
            page, 
            limit,
            priceRange,
            auctionType
        } = req.query;

        // Handle pagination
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        let matchStage = {};

        // Filter by category (if provided)
        if (category) {
            matchStage.category = new mongoose.Types.ObjectId(category); // Assuming category is a single ObjectId
        }

        // Filter auctions by type (if provided)

        if (auctionType) {
            // Split the CSV string into an array and match against auctionType field
            matchStage.auctionType = { $in: auctionType.split(",").map(type => type.trim()) };
        }


        // Filter by status (if provided)
        if (status) {
            matchStage.status = status; // ACTIVE or ENDED
        }



        // Search by product title or description
        if (searchQuery) {
            matchStage.$or = [
                { 'product.title': { $regex: searchQuery, $options: 'i' } },
                { 'product.description': { $regex: searchQuery, $options: 'i' } },
                {'lotNumber': { $regex: searchQuery, $options: 'i' } }
            ];
        }



        // Price Range filter (if provided)
        if (priceRange) {
            const priceValue = parseFloat(priceRange);
            if (!isNaN(priceValue)) {
                matchStage["product.price"] = { $lte: priceValue }; // Filter for products with price <= priceRange
            }
        }


        // Sorting logic for product price, auction start date, and current bid
        let sortStage = {};

        // Handle sorting by product price
        if (sortByPrice) {
            sortStage['product.price'] = sortByPrice == 'High Price' ? -1 : 1; // High to Low or Low to High
        } else if (sortField && sortOrder) {
            // General sorting
            if (sortField === 'startDate') {
                sortStage.startDate = sortOrder === 'asc' ? 1 : -1; // Oldest-Newest or Newest-Oldest
            } else if (sortField === 'currentBid') {
                sortStage.currentBid = sortOrder === 'asc' ? 1 : -1; // Low-High or High-Low
            } else if (sortField == 'product.price') {
                sortStage['product.price'] = sortOrder === 'asc' ? 1 : -1; // Sorting by product price
            }
        } else {
            sortStage.startDate = 1; // Default sort by startDate (Oldest First)
        }

        


        // Aggregation pipeline
        const auctions = await auctionModel.aggregate([
            { $sort: sortStage },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product',
                },
            },

            // {
            //     $lookup:{
            //         from: 'categories',
            //         localField: 'category',
            //         foreignField: '_id',
            //         as: 'category'
            //     }
            // },
            { $match: matchStage },
            { $unwind: '$product' }, // If you want the product data directly
            {
                $project: {
                    product: { title: 1, description: 1, price: 1 , _id: 1},
                    category :{ _id: 1, name: 1},
                    startingBid: 1,
                    currentBid: 1,
                    currentBidder: 1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    createdBy: 1,
                    winner: 1,
                    minBidIncrement: 1,
                    lotNumber: 1,
                    participants: 1,
                    bids: 1,
                    winnerBidTime: 1,
                    lotNumber: 1,
                    auctionType: 1,
                },
            },
        ]);




         // Format the startDate and endDate after aggregation
         const formattedAuctions = auctions.map(auction => ({
            ...auction,
            startDateFormatted: formatAuctionDate(auction.startDate),
            endDateFormatted: formatAuctionDate(auction.endDate),
        }));

        return success(res, 'Auctions retrieved successfully.', formattedAuctions);
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return unknownError(res, error.message);
    }
};


// User join the Auction //

export const joinAuction = async (req, res) => {
    try {


        const UserId = req.user._id;
        const {auctionId} = req.body;

        if(!auctionId){
            return badRequest(res, "Please provide Auction ID");
        }


        const findUser = await UserModel.findById(UserId)
        if(!findUser){
            return badRequest(res, "User not found")
        }

        // find auction by id //

        const findAuction = await auctionModel.findById(auctionId)
        if(!findAuction){
            return badRequest(res, "Auction not found")
        }

        // check if user already joined //
        if(findAuction.participants.includes(UserId)){
            return badRequest(res, "User already joined the auction")
        }

        // check end date of auction should be greater than current date //

        if(findAuction.endDate < Date.now()){
            return badRequest(res, "Auction has ended")
        }

        let paymentAmount = 100;
        if(findUser.walletBalance < paymentAmount){
            return badRequest(res, "Please add funds to your wallet to join the auction")
        }

        findUser.walletBalance -= paymentAmount;
        await findUser.save();


        findAuction.participants.push(UserId);
        await findAuction.save();

        return success(res, "User joined the auction successfully", findAuction)
    } catch (error) {
        console.log("error" , error)
        return unknownError(res, error);
    }
}


// add balance in wallet //

export const AddBalance = async (req, res) => {
    try {

        const UserId = req.user._id;
        if(!UserId){
            return badRequest(res , 'Please Provide the UserId')
        }

        const findUser = await UserModel.findById(UserId)
        if(!findUser){
            return badRequest(res, "User not found")
        }

        console.log("findUser" , findUser)


        const {name , email , mobile } = findUser
        
        const { amount, currency } = req.body;

        // Validate input
        if (!amount || !currency) {
            return badRequest(res, "Amount or currency not provided.");
        }

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            payment_method_types: ["card"],
            metadata: { 
                CustomerId: findUser._id.toString(),
                CustomerName: name,
                CustomerEmail: email,
                CustomerMobile: mobile,
                integration_check: "auction_payment" },
        });

        
        // Return client_secret to frontend
        // return response(res, 200, "Add Balance Successfully", {
        //     clientSecret: paymentIntent.client_secret,
        // });


        return success(res, "Add Balance Successfully", paymentIntent)
    } catch (error) {
        console.error("Stripe Error:", error);
        return unknownError(res, error);
    }
};



// called the webhook //

// Webhook function
// Webhook Function
export const stripeWebhook = async (req, res) => {

    console.log("req-row---------- >>>>>> "  , req.body)


    const sig = req.headers["stripe-signature"];

    console.log("sig->>>>>>>>>>>>" , sig)
    const endpointSecret = "whsec_rJ5wqkU5Pb49zRsd8qxMPrkDolhqTMal";


    console.log("endpointSecret------------- >>>>>>> " , endpointSecret)

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


            case "payment_intent.created":
                console.log(`🔄 Payment Intent Created for: ${paymentIntent.id}`);

                if (paymentIntent.metadata?.CustomerId) {
                    const userId = ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await UserModel.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    // Check if this payment was for an auction
                    if (paymentIntent.metadata.integration_check == "auction_payment") {
                        console.log("🏆 Auction payment detected. Updating winner status.");
                    
                        const updatedUser = await UserModel.findOneAndUpdate(
                            { _id: userId },
                            {
                                $set: {
                                    Payment_Status: "PROCESSING"
                                },
                            },
                            { new: true } // This should be outside the $set
                        );
                    
                        console.log("✅ Updated User:", updatedUser);
                    }
                    

                    // Check if this payment was for wallet top-up
                    if (paymentIntent.metadata.integration_check == "wallet_topup") {
                        console.log("💰 Wallet top-up detected. Adding balance.");
                        user.walletBalance += paymentIntent.amount / 100; // Convert cents to dollars
                        await user.save();
                    }
                }
        
                break;

            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                console.log(`💰 Payment successful: ${paymentIntent.id}`);

                if (paymentIntent.metadata?.CustomerId) {
                    const userId = ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await UserModel.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    // Check if this payment was for an auction
                    if (paymentIntent.metadata.integration_check == "auction_payment") {
                        console.log("🏆 Auction payment detected. Updating winner status.");
                    
                        const updatedUser = await UserModel.findOneAndUpdate(
                            { _id: userId },
                            {
                                $set: {
                                    Payment_Status: "PAID",
                                    walletBalance: 100, // Ensure this is the correct logic
                                },
                            },
                            { new: true } // This should be outside the $set
                        );
                    
                        console.log("✅ Updated User:", updatedUser);
                    }
                    

                    // Check if this payment was for wallet top-up
                    if (paymentIntent.metadata.integration_check == "wallet_topup") {
                        console.log("💰 Wallet top-up detected. Adding balance.");
                        user.walletBalance += paymentIntent.amount / 100; // Convert cents to dollars
                        await user.save();
                    }
                }
                break;

            case "payment_intent.payment_failed":
                console.log(`❌ Payment failed: ${event.data.object.id}`);
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("🚨 Webhook Processing Error:", error);
        return res.status(500).send("Internal Server Error.");
    }
};



