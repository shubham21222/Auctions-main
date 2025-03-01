import auctionModel from "../../models/Auction/auctionModel.js"
import { formatAuctionDate } from "../../Utils/time-zone.js"
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
import { validateMongoDbId } from "../../Utils/validateMongodbId.js"
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

// export const createAuction = async (req, res) => {
//     try {
//         const { product, startingBid, auctionType, endDate, startDate, createdBy, category, status } = req.body;

//         if (!product || !startingBid || !auctionType || !startDate || !category) {
//             return badRequest(res, "Please provide all required fields.");
//         }

//         // Fetch Product and Category simultaneously
//         const [productExists, categoryExists] = await Promise.all([
//             productModel.findById(product),
//             categoryModel.findById(category)
//         ]);

//         if (!productExists) {
//             return badRequest(res, "Product not found");
//         }
//         if (!categoryExists) {
//             return badRequest(res, "Category not found");
//         }



//         // Generate LOT number
//         const lotNumber = await generateLotNumber();

//         if (auctionType == "TIMED" && !endDate) {
//             return badRequest(res, "Timed auctions require an endDate.");
//         }

//         // Create new auction
//         const auction = new auctionModel({
//             product,
//             category,
//             startingBid,
//             currentBid: startingBid,
//             auctionType,
//             endDate: auctionType == "TIMED" ? endDate : null,
//             startDate,
//             lotNumber,
//             createdBy: req.user._id,
//             status: status || "ACTIVE"
//         });

//         await auction.save();
//         return created(res, "Auction created successfully.", auction);

//     } catch (error) {
//         console.error("Auction creation error:", error);
//         return unknownError(res, error.message);
//     }
// };


export const createAuction = async (req, res) => {
    try {
        const { product, startingBid, auctionType, endDate, startDate, createdBy, category, status } = req.body;

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

        if (auctionType === "TIMED" && !endDate) {
            return badRequest(res, "Timed auctions require an endDate.");
        }

        // Convert UTC to IST before saving
        const convertToIST = (date) => {
            const utcDate = new Date(date);
            return new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000); // Add 5.5 hours
        };

        const startDateIST = convertToIST(startDate);
        const endDateIST = auctionType === "TIMED" ? convertToIST(endDate) : null;

        // Create new auction
        const auction = new auctionModel({
            product,
            category,
            startingBid,
            currentBid: startingBid,
            auctionType,
            endDate: endDateIST,
            startDate: startDateIST,
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
            matchStage.category = new mongoose.Types.ObjectId(category);
        }

        // Filter auctions by type (if provided)
        if (auctionType) {
            matchStage.auctionType = { $in: auctionType.split(",").map(type => type.trim()) };
        }

        // Filter by status (if provided)
        if (status) {
            matchStage.status = status; // ACTIVE or ENDED
        }

        // Search by product title, description, or lot number
        if (searchQuery) {
            matchStage.$or = [
                { 'product.title': { $regex: searchQuery, $options: 'i' } },
                { 'product.description': { $regex: searchQuery, $options: 'i' } },
                { 'lotNumber': { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Price Range filter (if provided)
        if (priceRange) {
            const priceValue = parseFloat(priceRange);
            if (!isNaN(priceValue)) {
                matchStage["product.price"] = { $lte: priceValue };
            }
        }

        // Sorting logic
        let sortStage = {};
        if (sortByPrice) {
            sortStage['product.price'] = sortByPrice === 'High Price' ? -1 : 1;
        } else if (sortField && sortOrder) {
            const order = sortOrder === 'asc' ? 1 : -1;
            if (sortField === 'startDate') {
                sortStage.startDate = order;
            } else if (sortField === 'currentBid') {
                sortStage.currentBid = order;
            } else if (sortField === 'product.price') {
                sortStage['product.price'] = order;
            }
        } else {
            sortStage.startDate = -1; // Default sort by startDate (Oldest First)
        }

        // console.log("Match Query:", JSON.stringify(matchStage, null, 2));
        // console.log("Sort Stage:", JSON.stringify(sortStage, null, 2));

        // Aggregation pipeline
        const auctions = await auctionModel.aggregate([
            { $match: matchStage }, // Match First
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }, // Unwind but keep nulls
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },

            // Paticipants /

            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participants'
                }
            },

            { $sort: sortStage },
            { $skip: skip },
            { $limit: pageSize },
            {
                $project: {
                    product: {
                        title: { $ifNull: ["$product.title", ""] },
                        description: { $ifNull: ["$product.description", ""] },
                        price: { $ifNull: ["$product.price", ""] },
                        _id: { $ifNull: ["$product._id", ""] }
                    },
                    category: { _id: 1, name: 1 },
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
                    bids: 1,
                    winnerBidTime: 1,
                    auctionType: 1,
                    participants: {
                        $map: {
                            input: "$participants",
                            as: "participant",
                            in: {
                                _id: { $ifNull: ["$$participant._id", ""] },
                                name: { $ifNull: ["$$participant.name", ""] },
                                email: { $ifNull: ["$$participant.email", ""] }
                            }
                        }
                    },
                },
            },
        ]);

        // Check if auctions array is empty
        if (auctions.length === 0) {
            return success(res, 'No auctions found.', []);
        }

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


// get auction by id //

export const getAuctionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return validation(res, 'Invalid auction ID.');
        }

        const findAuction = await auctionModel.findById(id);
        if (!findAuction) {
            return notFound(res, 'Auction not found.');
        }

        const auction = await auctionModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participants'
                }
            },
            {
                $project: {
                    product: {
                        title: { $ifNull: ["$product.title", ""] },
                        description: { $ifNull: ["$product.description", ""] },
                        price: { $ifNull: ["$product.price", ""] },
                        _id: { $ifNull: ["$product._id", ""] }
                    },
                    category: { _id: 1, name: 1 },
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
                    bids: 1,
                    winnerBidTime: 1,
                    auctionType: 1,
                    participants: {
                        $map: {
                            input: "$participants",
                            as: "participant",
                            in: {
                                _id: { $ifNull: ["$$participant._id", ""] },
                                name: { $ifNull: ["$$participant.name", ""] },
                                email: { $ifNull: ["$$participant.email", ""] }
                            }
                        }
                    },
                },
            },
        ]);

        if (!auction.length) {
            return success(res, 'No auction found.', null);
        }

        const formattedAuction = {
            ...auction[0],
            startDateFormatted: formatAuctionDate(auction[0].startDate),
            endDateFormatted: formatAuctionDate(auction[0].endDate),
        };

        return success(res, 'Auction retrieved successfully.', formattedAuction);
    } catch (error) {
        console.error('Error fetching auction by ID:', error);
        return unknownError(res, error.message);
    }
};


// Update the auction //

export const updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const { product, startingBid, auctionType, endDate, startDate, category, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return validation(res, 'Invalid auction ID.');
        }

        const findAuction = await auctionModel.findById(id);
        if (!findAuction) {
            return notFound(res, 'Auction not found.');
        }

        if (product) {
            findAuction.product = product;
        }

        if (startingBid) {
            findAuction.startingBid = startingBid;
        }

        if (auctionType) {
            findAuction.auctionType = auctionType;
        }

        if (endDate) {
            findAuction.endDate = endDate;
        }

        if (startDate) {
            findAuction.startDate = startDate;
        }

        if (category) {
            findAuction.category = category;
        }

        if (status) {
            findAuction.status = status;
        }

        await findAuction.save();
        return success(res, 'Auction updated successfully.', findAuction);
    } catch (error) {
        console.error('Error updating auction:', error);
        return unknownError(res, error.message);
    }
}

// Delete the auction  with multiple id //

export const deleteAuction = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !ids.length) {
            return badRequest(res, 'Please provide auction IDs.');
        }

        const deletedAuctions = await auctionModel.deleteMany({ _id: { $in: ids } });
        if (!deletedAuctions.deletedCount) {
            return notFound(res, 'Auctions not found.');
        }

        return success(res, 'Auctions deleted successfully.');
    } catch (error) {
        console.error('Error deleting auctions:', error);
        return unknownError(res, error.message);
    }
}




// User join the Auction //

export const joinAuction = async (req, res) => {
    try {


        const UserId = req.user._id;
        const { auctionId } = req.body;

        if (!auctionId) {
            return badRequest(res, "Please provide Auction ID");
        }


        const findUser = await UserModel.findById(UserId)
        if (!findUser) {
            return badRequest(res, "User not found")
        }

        // find auction by id //

        const findAuction = await auctionModel.findById(auctionId)
        if (!findAuction) {
            return badRequest(res, "Auction not found")
        }

        // check if user already joined //
        if (findAuction.participants.includes(UserId)) {
            return badRequest(res, "User already joined the auction")
        }

        // check end date of auction should be greater than current date //

        if (findAuction.endDate < Date.now()) {
            return badRequest(res, "Auction has ended")
        }

        if (findUser.Payment_Status !== "PAID") {
            return badRequest(res, "Please complete the payment to join the auction")
        }

        findAuction.participants.push(UserId);
        await findAuction.save();

        return success(res, "User joined the auction successfully", findAuction)
    } catch (error) {
        console.log("error", error)
        return unknownError(res, error);
    }
}


// add balance in wallet //

export const AddBalance = async (req, res) => {
    try {

        const UserId = req.user._id;
        if (!UserId) {
            return badRequest(res, 'Please Provide the UserId')
        }

        const findUser = await UserModel.findById(UserId)
        if (!findUser) {
            return badRequest(res, "User not found")
        }

        if (findUser.Payment_Status == "PAID") {
            return badRequest(res, "Payment already done")
        }

        console.log("findUser", findUser)


        const { name, email, mobile } = findUser

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
                integration_check: "auction_payment"
            },
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


export const stripeWebhook = async (req, res) => {
    console.log("req-row---------- >>>>>> ", req.body);

    const sig = req.headers["stripe-signature"];
    const endpointSecret = "whsec_rJ5wqkU5Pb49zRsd8qxMPrkDolhqTMal";

    console.log("sig->>>>>>>>>>>>", sig);
    console.log("endpointSecret------------- >>>>>>>", endpointSecret);

    if (!sig || !endpointSecret) {
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
        const paymentIntent = event.data.object; // ✅ Declare before using

        switch (event.type) {
            case "payment_intent.created":
                console.log(`🔄 Payment Intent Created for: ${paymentIntent.id}`);

                if (paymentIntent.metadata?.CustomerId) {
                    const userId = new ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await UserModel.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    if (paymentIntent.metadata.integration_check == "auction_payment") {
                        console.log("🏆 Auction payment detected. Updating winner status.");

                        const updatedUser = await UserModel.findOneAndUpdate(
                            { _id: userId },
                            { $set: { Payment_Status: "PROCESSING" } },
                            { new: true }
                        );

                        console.log("✅ Updated User:", updatedUser);
                    }
                }
                break;

            case "payment_intent.succeeded":
                console.log(`💰 Payment successful: ${paymentIntent.id}`);

                if (paymentIntent.metadata?.CustomerId) {
                    const userId = new ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await UserModel.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    if (paymentIntent.metadata.integration_check == "auction_payment") {
                        console.log("🏆 Auction payment detected. Updating winner status.");

                        const updatedUser = await UserModel.findOneAndUpdate(
                            { _id: userId },
                            { $set: { Payment_Status: "PAID", walletBalance: user.walletBalance + (paymentIntent.amount / 100) } },
                            { new: true }
                        );

                        console.log("✅ Updated User:", updatedUser);
                    }

                }
                break;

            case "payment_intent.payment_failed":
                if (paymentIntent.metadata?.CustomerId) {
                    const userId = new ObjectId(paymentIntent.metadata.CustomerId);
                    const user = await UserModel.findById(userId);

                    if (!user) {
                        console.error("❌ User not found for ID:", userId);
                        return res.status(400).send("User not found.");
                    }

                    if (paymentIntent.metadata.integration_check == "auction_payment") {
                        console.log("🏆 Auction payment detected. Updating winner status.");

                        const updatedUser = await UserModel.findOneAndUpdate(
                            { _id: userId },
                            { $set: { Payment_Status: "FAILED", walletBalance: 0 } },
                            { new: true }
                        );

                        console.log("✅ Updated User:", updatedUser);
                    }

                }
                console.log(`❌ Payment failed: ${paymentIntent.id}`);
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


// Update the payment status amd wallet balance //


export const updatePaymentStatus = async (req, res) => {

    try {

        const { userId, status } = req.body;

        if (!userId || !status) {
            return badRequest(res, "Please provide User ID and status.");
        }

        const user = await UserModel
            .findById(userId);

        if (!user) {
            return notFound(res, "User not found");
        }

        user.Payment_Status = status;
        user.walletBalance = status == "PAID" ? user.walletBalance + 100 : user.walletBalance;
        await user.save();
        return success(res, "Payment status updated successfully", user);

    } catch (error) {

        return unknownError(res, error.message);

    }
}




