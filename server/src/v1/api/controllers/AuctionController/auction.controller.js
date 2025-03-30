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
import AuctionProduct from "../../models/Auction/auctionProductModel.js"
import categoryModel from "../../models/Category/category.model.js"
import AuctionCategoryModel from "../../models/Category/Aunctioncat.model.js"
import UserModel from "../../models/Auth/User.js"
import OrderModel from "../../models/Order/order.js"
import stripe from "../../config/stripeConfig.js"
import bidIncrementModel from "../../models/Auction/bidIncrementModel.js"
import moment from "moment"; // Install moment.js if not installed
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


        // Create new auction
        const auction = new auctionModel({
            product,
            category,
            startingBid,
            currentBid: startingBid,
            auctionType,
            endDate,
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
            {
                $lookup: {
                    from: 'users',
                    localField: 'bids.bidder',
                    foreignField: '_id',
                    as: 'bidderDetails'
                }
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'bids.bidder',
                    foreignField: '_id',
                    as: 'bidderDetails'
                }
            },
            {
                $addFields: {
                    bids: {
                        $map: {
                            input: "$bids",
                            as: "bid",
                            in: {
                                bidder: "$$bid.bidder",
                                bidAmount: "$$bid.bidAmount",
                                bidTime: "$$bid.bidTime",
                                paid: "$$bid.paid",
                                bidderDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$bidderDetails",
                                                as: "bidder",
                                                cond: { $eq: ["$$bidder._id", "$$bid.bidder"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },

            // Paticipants /

            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participants'
                }
            },
            {
              $lookup:{
                from:'users',
                localField:'winner',
                foreignField:'_id',
                as:'winner'

              }
            },
            {
              $unwind:{
                path:'$winner',
                preserveNullAndEmptyArrays:true
              }
            },

            {
                $lookup: {
                    from: 'bidincrements',
                    let: { currentBid: "$currentBid" },
                    pipeline: [
                        { $match: { $expr: { $lte: ["$price", "$$currentBid"] } } },
                        { $sort: { price: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'bidIncrementRule'
                }
            },

            {
                $addFields: {
                    minBidIncrement: {
                        $ifNull: [{ $arrayElemAt: ["$bidIncrementRule.increment", 0] }, 0]
                    }
                }
            },

            { $sort: sortStage },
            { $skip: skip },
            { $limit: pageSize },
            {
                $project: {
                    product: {
                        title: { $ifNull: ["$product.title", ""] },
                        // description: { $ifNull: ["$product.description", ""] },
                        price: { $ifNull: ["$product.price", ""] },
                        _id: { $ifNull: ["$product._id", ""] }
                    },
                    category: { _id: 1, name: 1 },
                    startingBid: 1,
                    currentBid: 1,
                    currentBidder: 1,
                    payment_status:1,
                    shipping_status:1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    createdBy: 1,
                    winner:{
                        _id:1,
                        name:1,
                        email:1
                    },
                    minBidIncrement: 1,  // ✅ Added Minimum Bid Incremen
                    lotNumber: 1,
                    bids: {
                        $map: {
                            input: "$bids",
                            as: "bid",
                            in: {
                                bidAmount: "$$bid.bidAmount",
                                bidTime: "$$bid.bidTime",
                                paid: "$$bid.paid",
                                bidder: {
                                    _id: "$$bid.bidderDetails._id",
                                    name: "$$bid.bidderDetails.name",
                                    email: "$$bid.bidderDetails.email"
                                }
                            }
                        }
                    },
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


        return success(res, 'Auctions retrieved successfully.', {
           formattedAuctions,
            totalAuction: auctions.length,
            page: pageNumber,
            limit: pageSize,
        });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return unknownError(res, error.message);
    }
};


// get bulk auctions //

export const getbulkAuctions = async (req, res) => {
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
            auctionType,
            catalog,
            payment_status,
            shipping_status// New catalog query parameter
        } = req.query;

        // Handle pagination
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10000;
        const skip = (pageNumber - 1) * pageSize;

        let matchStage = {};

        // Filter by category
        if (category) {
            matchStage.category = new mongoose.Types.ObjectId(category);
        }

        // Filter by auctionType
        if (auctionType) {
            matchStage.auctionType = { $in: auctionType.split(",").map(type => type.trim()) };
        }

        // Filter by status
        if (status) {
            matchStage.status = status;
        }

        // Filter by catalog
        if (catalog) {
            matchStage.catalog = catalog; // Assuming catalog is a string field
        }

        if(payment_status){
            matchStage.payment_status = shipping_status
        }

        if (shipping_status){
            matchStage.shipping_status = shipping_status
        }

        // Search by product title, description, or lot number
        if (searchQuery) {
            matchStage.$or = [
                { 'product.title': { $regex: searchQuery, $options: 'i' } },
                { 'product.description': { $regex: searchQuery, $options: 'i' } },
                { 'lotNumber': { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Filter by price range
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
            sortStage.startDate = -1;
        }

        // Aggregation pipeline
        const auctions = await auctionModel.aggregate([
            { $match: matchStage }, // Filter auctions
            {
                $lookup: {
                    from: 'auctionproducts',
                    localField: 'auctionProduct',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'aunctioncategories',
                    localField: 'auctioncategory',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'bids.bidder',
                    foreignField: '_id',
                    as: 'bidderDetails'
                }
            },
            {
                $addFields: {
                    bids: {
                        $map: {
                            input: "$bids",
                            as: "bid",
                            in: {
                                bidder: "$$bid.bidder",
                                bidAmount: "$$bid.bidAmount",
                                bidTime: "$$bid.bidTime",
                                paid: "$$bid.paid",
                                bidderDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$bidderDetails",
                                                as: "bidder",
                                                cond: { $eq: ["$$bidder._id", "$$bid.bidder"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participants'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'winner',
                    foreignField: '_id',
                    as: 'winner'
                }
            },
            { $unwind: { path: '$winner', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'bidincrements',
                    let: { currentBid: "$currentBid" },
                    pipeline: [
                        { $match: { $expr: { $lte: ["$price", "$$currentBid"] } } },
                        { $sort: { price: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'bidIncrementRule'
                }
            },
            {
                $addFields: {
                    minBidIncrement: {
                        $ifNull: [{ $arrayElemAt: ["$bidIncrementRule.increment", 0] }, 0]
                    }
                }
            },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: pageSize },
            {
                $project: {
                    catalog: 1, // Include catalog in final data
                    product: {
                        title: { $ifNull: ["$product.title", ""] },
                        price: { $ifNull: ["$product.price", ""] },
                        image:{$ifNull: ["$product.image", ""]},
                        estimateprice:{$ifNull: ["$product.estimateprice", ""]},
                        offerAmount:{$ifNull: ["$product.offerAmount", ""]},
                        sellPrice:{$ifNull: ["$product.sellPrice", ""]},
                        ReservePrice:{$ifNull: ["$product.ReservePrice", ""]},
                        skuNumber:{$ifNull: ["$product.skuNumber", ""]},
                        stock:{$ifNull: ["$product.stock", ""]},
                        _id: { $ifNull: ["$product._id", ""] }
                    },
                    category: { _id: 1, name: 1 },
                    startingBid: 1,
                    description:1,
                    currentBid: 1,
                    currentBidder: 1,
                    payment_status: 1,
                    shipping_status:1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    createdBy: 1,
                    winner: {
                        _id: 1,
                        name: 1,
                        email: 1
                    },
                    minBidIncrement: 1,
                    lotNumber: 1,
                    bids: {
                        $map: {
                            input: "$bids",
                            as: "bid",
                            in: {
                                bidAmount: "$$bid.bidAmount",
                                bidTime: "$$bid.bidTime",
                                paid: "$$bid.paid",
                                bidder: {
                                    _id: "$$bid.bidderDetails._id",
                                    name: "$$bid.bidderDetails.name",
                                    email: "$$bid.bidderDetails.email"
                                }
                            }
                        }
                    },
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
            {
                $group: {
                    _id: "$catalog",
                    auctions: { $push: "$$ROOT" } // Group auctions under their respective catalog
                }
            }
        ]);

        // Check if auctions array is empty
        if (auctions.length === 0) {
            return success(res, 'No auctions found.', []);
        }

        return success(res, 'Auctions retrieved successfully.', {
            catalogs: auctions.map(catalog => ({
                catalogName: catalog._id || "Uncategorized",
                auctions: catalog.auctions
            })),
            totalAuction: auctions.reduce((acc, catalog) => acc + catalog.auctions.length, 0),
            page: pageNumber,
            limit: pageSize,
        });
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

            // ✅ Lookup for Minimum Bid Increment
            {
                $lookup: {
                    from: 'bidincrements',
                    let: { currentBid: "$currentBid" },
                    pipeline: [
                        { $match: { $expr: { $lte: ["$price", "$$currentBid"] } } },
                        { $sort: { price: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'bidIncrementRule'
                }
            },

            {
                $addFields: {
                    minBidIncrement: {
                        $ifNull: [{ $arrayElemAt: ["$bidIncrementRule.increment", 0] }, 0]
                    }
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
                    payment_status:1,
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


// get auction buik //

export const getbulkAuctionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest(res, 'Invalid auction ID.');
        }

        const auction = await auctionModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'auctionproducts',
                    localField: 'auctionProduct',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'aunctioncategories',
                    localField: 'auctioncategory',
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
                $lookup: {
                    from: 'users',
                    localField: 'winner',
                    foreignField: '_id',
                    as: 'winner'
                }
            },
            { $unwind: { path: '$winner', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'bids.bidder',
                    foreignField: '_id',
                    as: 'bidderDetails'
                }
            },
            {
                $addFields: {
                    bids: {
                        $map: {
                            input: "$bids",
                            as: "bid",
                            in: {
                                bidAmount: "$$bid.bidAmount",
                                bidTime: "$$bid.bidTime",
                                paid: "$$bid.paid",
                                bidder: {
                                    _id: "$$bid.bidder",
                                    name: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$bidderDetails",
                                                    as: "bidder",
                                                    cond: { $eq: ["$$bidder._id", "$$bid.bidder"] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'bidincrements',
                    let: { currentBid: "$currentBid" },
                    pipeline: [
                        { $match: { $expr: { $lte: ["$price", "$$currentBid"] } } },
                        { $sort: { price: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'bidIncrementRule'
                }
            },
            {
                $addFields: {
                    minBidIncrement: {
                        $ifNull: [{ $arrayElemAt: ["$bidIncrementRule.increment", 0] }, 0]
                    }
                }
            },
            {
                $project: {
                    catalog: 1,
                    product: {
                        title: { $ifNull: ["$product.title", ""] },
                        price: { $ifNull: ["$product.price", ""] },
                        description: { $ifNull: ["$product.description", ""] },
                        image:{$ifNull: ["$product.image", ""]},
                        estimateprice:{$ifNull: ["$product.estimateprice", ""]},
                        offerAmount:{$ifNull: ["$product.offerAmount", ""]},
                        sellPrice:{$ifNull: ["$product.sellPrice", ""]},
                        ReservePrice:{$ifNull: ["$product.ReservePrice", ""]},
                        skuNumber:{$ifNull: ["$product.skuNumber", ""]},
                        stock:{$ifNull: ["$product.stock", ""]},
                        _id: { $ifNull: ["$product._id", ""] }
                    },
                    category: { _id: 1, name: 1 },
                    description:1,
                    startingBid: 1,
                    currentBid: 1,
                    currentBidder: 1,
                    payment_status: 1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    createdBy: 1,
                    winner: {
                        _id: 1,
                        name: 1,
                        email: 1
                    },
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
                }
            }
        ]);

        if (!auction.length) {
            return success(res, 'Auction not found.', null);
        }

        return success(res, 'Auction retrieved successfully.', auction[0]);
    } catch (error) {
        console.error('Error fetching auction:', error);
        return unknownError(res, error.message);
    }
};



// Update the auction //

export const updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const { product, startingBid, auctionType, endDate, startDate, category, status , shipping_status } = req.body;

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

        if(shipping_status){
            findAuction.shipping_status = shipping_status
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



// Place a bid //

export const placeBid = async (req, res) => {
    try {
        const { auctionId, bidAmount } = req.body;

        if (!auctionId || !bidAmount) {
            return badRequest(res, "Please provide both auction ID and bid amount.");
        }

        if (isNaN(bidAmount) || bidAmount <= 0) {
            return badRequest(res, "Bid amount should be a valid positive number.");
        }

        const findAuction = await auctionModel.findById(auctionId);
        if (!findAuction) {
            return notFound(res, "Auction not found.");
        }

        if (findAuction.status !== "ACTIVE") {
            return badRequest(res, "This auction is no longer active.");
        }

        if (new Date(findAuction.endDate).getTime() < Date.now()) {
            return badRequest(res, "This auction has already ended.");
        }

        console.log("Current Bid:", findAuction.currentBid);
        console.log("Bid Amount:", bidAmount);

        // Ensure bid is greater than the current bid
        if (bidAmount <= findAuction.currentBid) {
            return badRequest(res, "Your bid must be higher than the current bid.");
        }


          // ✅ Fetch bid increment rule based on current price

       // ✅ Fetch bid increment rule based on the current bid price
       const bidRule = await bidIncrementModel
       .findOne({ price: { $lte: findAuction.currentBid } })
       .sort({ price: -1 });

    //    console.log("Bid Rule:", bidRule);

   if (!bidRule) {
       return badRequest(res, "Bid increment rule not found.");
   }

   const requiredBid = findAuction.currentBid + bidRule.increment;

   // Ensure bid is at least the minimum required bid
   if (bidAmount < requiredBid) {
       return badRequest(res, `Your bid must be at least $${requiredBid}.`);
   }


        // Update auction with new bid
        findAuction.currentBid = bidAmount;
        findAuction.minBidIncrement = requiredBid;
        findAuction.currentBidder = req.user._id;
        findAuction.bids.push({
            bidder: req.user._id,
            bidAmount,
            bidTime: new Date(),
        });

        await findAuction.save();

        return success(res, "Bid placed successfully.", findAuction);
    } catch (error) {
        console.error("Error placing bid:", error);
        return unknownError(res, error.message);
    }
};



export const getAuctionDetails = async (req, res) => {
    try {
        const { auctionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return badRequest(res, "Invalid auction ID format.");
        }

        const auctionDetails = await auctionModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(auctionId) } },

            // Fetch Participants
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participantsDetails"
                }
            },

            {
                  $unwind: {
                    path: "$participantsDetails",
                    preserveNullAndEmptyArrays: true
                  }
            },

            // Fetch Product Details
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },

            // Fetch Category Details
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

            // Fetch Winner Details
            {
                $lookup: {
                    from: "users",
                    localField: "winner",
                    foreignField: "_id",
                    as: "winnerDetails"
                }
            },
            { $unwind: { path: "$winnerDetails", preserveNullAndEmptyArrays: true } },

            // Fetch Bids & Bidders
            { $unwind: { path: "$bids", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "bids.bidder",
                    foreignField: "_id",
                    as: "bids.bidderDetails"
                }
            },
            {
                $unwind: { path: "$bids.bidderDetails", preserveNullAndEmptyArrays: true }
            },

            {
                $group: {
                    _id: "$_id",
                    product: {
                        $first: {
                            title: "$productDetails.title",
                            price: "$productDetails.price",
                            image: "$productDetails.image",
                        }
                    },
                    category: {
                        $first: {
                            _id: "$categoryDetails._id",
                            name: "$categoryDetails.name"
                        }
                    },
                    status: { $first: "$status" },
                    auctionType: { $first: "$auctionType" },
                    startDate: { $first: "$startDate" },
                    payment_status:{ $first: "$payment_status" },
                    endDate: { $first: "$endDate" },
                    participants:{
                        $push:{
                            _id:"$participantsDetails._id",
                            name:"$participantsDetails.name",
                            email:"$participantsDetails.email"
                        }
                    },
                    winner: { 
                        $first: {
                            _id: "$winnerDetails._id",
                            name: "$winnerDetails.name",
                            email: "$winnerDetails.email"
                        }
                    },
                    bids: {
                        $push: {
                            bidAmount: "$bids.bidAmount",
                            bidTime: "$bids.bidTime",
                            bidder: {
                                _id: "$bids.bidderDetails._id",
                                name: "$bids.bidderDetails.name",
                                email: "$bids.bidderDetails.email"
                            }
                        }
                    }
                }
            }
        ]);

        if (!auctionDetails.length) {
            return notFound(res, "Auction not found.");
        }

        return success(res, "Auction details retrieved successfully.", auctionDetails[0]);

    } catch (error) {
        console.error("Error fetching auction details:", error);
        return unknownError(res, error.message);
    }
};



export const getUserAuctions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { searchQuery } = req.query; // Extract search query from request

        if (!userId) {
            return badRequest(res, "Please provide user ID.");
        }

        // Check if user exists
        const findUser = await UserModel.findById(userId);
        if (!findUser) {
            return badRequest(res, "User not found");
        }

        // Match condition for user participation
        let matchStage = { participants: new mongoose.Types.ObjectId(userId) };

        // Apply search filter
        if (searchQuery) {
            matchStage.$or = [
                { "product.title": { $regex: searchQuery, $options: "i" } }, // Case-insensitive search in product title
                { lotNumber: { $regex: searchQuery, $options: "i" } }, // Search by lot number
                { auctionType: { $regex: searchQuery, $options: "i" } } // Search by auction type
            ];
        }

        // Fetch auctions where user is a participant with search filter
        const auctions = await auctionModel.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'auctionproducts',
                    localField: 'auctionProduct',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "currentBidder",
                    foreignField: "_id",
                    as: "currentBidder",
                },
            },
            { $unwind: { path: "$currentBidder", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "winner",
                    foreignField: "_id",
                    as: "winnerDetails",
                },
            },
            { $unwind: { path: "$winnerDetails", preserveNullAndEmptyArrays: true } },

    
            {
                $project: {
                    product: {
                        title: 1,
                        price: 1,
                        image: 1,
                        _id: 1,
                    },
                    startingBid: 1,
                    currentBid: 1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    lotNumber: 1,
                    auctionType: 1,
                    payment_status:1,
                    currentBidder: {
                        _id: 1,
                        name: 1,
                        email: 1,
                    },
                    winnerYou: {
                        $cond: {
                            if: { $eq: ["$winner", new mongoose.Types.ObjectId(userId)] },
                            then: "$winnerDetails.name",
                            else: ""
                        }
                    },
                },
            },
        ]);

        if (!auctions.length) {
            return success(res, "No auctions found where user participated.", []);
        }

        return success(res, "User's participated auctions retrieved successfully.", auctions);
    } catch (error) {
        console.error("Error fetching user's auctions:", error);
        return unknownError(res, error.message);
    }
};

// Dashboard //


export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); 
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const startOfWeek = moment().startOf("isoWeek").toDate(); // Monday 00:00:00
const endOfWeek = moment().endOf("isoWeek").toDate(); // Sunday 23:59:59

        // Total Revenue
        const totalRevenueData = await OrderModel.aggregate([
            { $match: { paymentStatus: "SUCCEEDED" } },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalAmount : 0;

        // console.log("firstDayLastMonth:", firstDayLastMonth);
        // console.log("lastDayLastMonth:", lastDayLastMonth);

        // Last Month Revenue
        const lastMonthRevenueData = await OrderModel.aggregate([
            { $match: { paymentStatus: "SUCCEEDED", createdAt: { $gte: firstDayLastMonth, $lt: lastDayLastMonth } } },
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
        ]);


        const lastMonthRevenue = lastMonthRevenueData.length > 0 ? lastMonthRevenueData[0].totalAmount : 0;
        const revenueChange = lastMonthRevenue ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        // Active Users
        const activeUsers = await UserModel.countDocuments();
        const lastMonthUsers = await UserModel.countDocuments({ createdAt: { $gte: firstDayLastMonth, $lt: lastDayLastMonth } });
        const userChange = lastMonthUsers ? ((activeUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

        // Active Auctions
        const activeAuctions = await auctionModel.countDocuments({ status: "ACTIVE" });

        // Total Sales
        const totalSalesData = await OrderModel.aggregate([
            { $match: { paymentStatus: "SUCCEEDED" } },
            {
                $group: {
                    _id: null,
                    totalSalesCount: { $sum: 1 },
                    totalSalesAmount: { $sum: "$totalAmount" }
                }
            }
        ]);
        const totalSalesCount = totalSalesData.length > 0 ? totalSalesData[0].totalSalesCount : 0;
        const totalSalesAmount = totalSalesData.length > 0 ? totalSalesData[0].totalSalesAmount : 0;

        // Last Month Sales
        const lastMonthSalesData = await OrderModel.aggregate([
            { $match: { paymentStatus: "SUCCEEDED", createdAt: { $gte: firstDayLastMonth, $lt: lastDayLastMonth } } },
            {
                $group: {
                    _id: null,
                    totalSalesCount: { $sum: 1 },
                    totalSalesAmount: { $sum: "$totalAmount" }
                }
            }
        ]);
        const lastMonthSalesCount = lastMonthSalesData.length > 0 ? lastMonthSalesData[0].totalSalesCount : 0;
        const lastMonthSalesAmount = lastMonthSalesData.length > 0 ? lastMonthSalesData[0].totalSalesAmount : 0;

        const salesChange = lastMonthSalesCount ? ((totalSalesCount - lastMonthSalesCount) / lastMonthSalesCount) * 100 : 0;

        // Monthly Sales (Jan - Dec)
        const monthlySales = await OrderModel.aggregate([
            { $match: { paymentStatus: "SUCCEEDED" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        const monthlySalesData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            totalSales: monthlySales.find((s) => s._id === i + 1)?.totalSales || 0
        }));

        // Weekly Visitors (Mon-Sat)
        const weeklyVisitors = await UserModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek } // Filter current week users
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week (1 = Sunday, 7 = Saturday)
                    visitors: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } } // Sort results from Sunday (1) to Saturday (7)
        ]);
        
        // Mapping weekdays correctly (Sunday-Saturday)
        const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weeklyVisitorsData = weekDays.map((day, i) => ({
            day,
            visitors: weeklyVisitors.find((v) => v._id === i + 1)?.visitors || 0
        }));

        
    
        

        // Send Response
        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                revenueChange: revenueChange.toFixed(2) + "%",
                activeUsers,
                userChange: userChange.toFixed(2) + "%",
                activeAuctions,
                totalSales: {
                    count: totalSalesCount,
                    amount: totalSalesAmount
                },
                salesChange: salesChange.toFixed(2) + "%",
                monthlySales: monthlySalesData,
                weeklyVisitors: weeklyVisitorsData
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



// Admin set the Bid Increment //

export const setBidIncrement = async (req, res) => {
    try {
        const { increments } = req.body;

        if (!Array.isArray(increments) || increments.length === 0) {
            return badRequest(res, "Please provide a valid increments array.");
        }

        for (const increment of increments) {
            const { price, increment: bidIncrement } = increment;

            if (isNaN(price) || isNaN(bidIncrement) || price < 0 || bidIncrement <= 0) {
                return badRequest(res, "Each entry must have a valid price and increment value.");
            }

            await bidIncrementModel.findOneAndUpdate(
                { price },  // Find by price
                { increment: bidIncrement }, // Update increment value
                { upsert: true, new: true }  // Insert if not exists
            );
        }

        return success(res, "Bid increments updated successfully.");
    } catch (error) {
        return unknownError(res, error);
    }
};



export const getBidIncrement = async (req, res) => {
    try{
        const increments = await bidIncrementModel.find().sort({ price: 1 });
        return success(res , "Bid increments retrieved successfully" , increments)
    }catch(error){
        return unknownError(res , error)
    }
}



export const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        switch (event.type) {
            // ✅ Successful Payment from Payment Link
            case "checkout.session.completed": {
                const session = event.data.object;
                console.log(`💰 Payment successful: ${session.id}`);

                if (session.metadata && session.metadata.auctionId) {
                    const auctionId = session.metadata.auctionId;

                    // ✅ Update Auction as PAID
                    const updatedAuction = await auctionModel.findByIdAndUpdate(
                        auctionId,
                        { payment_status: "PAID" },
                        { new: true }
                    );

                    if (updatedAuction) {
                        console.log(`✅ Auction ${auctionId} marked as PAID.`);
                    } else {
                        console.error(`❌ Auction not found for ID: ${auctionId}`);
                    }
                }
                break;
            }

            // ❌ Payment Link Expired
            case "checkout.session.expired": {
                const session = event.data.object;
                console.log(`⌛ Payment link expired: ${session.id}`);

                if (session.metadata && session.metadata.auctionId) {
                    const auctionId = session.metadata.auctionId;

                    // ❌ Mark Auction as EXPIRED
                    const updatedAuction = await auctionModel.findByIdAndUpdate(
                        auctionId,
                        { payment_status: "FAILED" },
                        { new: true }
                    );

                    if (updatedAuction) {
                        console.log(`⌛ Auction ${auctionId} marked as EXPIRED.`);
                    } else {
                        console.error(`❌ Auction not found for ID: ${auctionId}`);
                    }
                }
                break;
            }

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.status(200).send("Webhook received");
    } catch (err) {
        console.error("❌ Webhook verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};




export const createBulkAuction = async (req, res) => {
    try {
        const { products, auctionType,  status, category , desciptions , stateDate ,  endDate } = req.body;


        if (!Array.isArray(products) || products.length === 0) {
            return badRequest(res, "Please provide an array of products.");
        }
        if ( !category) {
            return badRequest(res, "Missing catalog fields.");
        }

        if(!stateDate){
            return badRequest(res, "Missing startDate fields.");
        }

        // ✅ Check if category exists by name, create if not found
        let categoryExists = await AuctionCategoryModel.findOne({ name: category });
        if (!categoryExists) {
            categoryExists = await AuctionCategoryModel.create({ name: category });
        }
        const auctions = [];

        // ✅ Process all products in parallel
        await Promise.all(products.map(async (productData) => {
            // ✅ Check if product exists
            let product = await AuctionProduct.findOne({ title: productData.title });

            // ✅ Create product if not found
            if (!product) {
                product = await AuctionProduct.create({
                    title: productData.title || "Untitled Product",
                    description: req.body.desciptions || "No description",
                    price: product.price || 0,
                    estimateprice: productData.estimateprice || "N/A",
                    offerAmount: productData.offerAmount || 0,
                    onlinePrice: productData.onlinePrice || 0,
                    sellPrice: productData.sellPrice || 0,
                    startDate: stateDate,
                    endDate:endDate,
                    ReservePrice: productData.ReservePrice || 0,
                    category: categoryExists._id, // ✅ Assign category ID
                    image: productData.image || [],
                    skuNumber: productData.skuNumber || "N/A",
                    lotNumber: productData.lotNumber || await generateLotNumber(),
                    status: "Not Sold",
                    favorite: false,
                    sortByPrice: productData.sortByPrice || "Low Price",
                    details: productData.details || [],
                    stock: productData.stock || 1,
                    type: productData.type || "",
                    auctionType: productData.auctionType || " ",
                    count: 1
                });
            }


            // ✅ Push auction data to array (No DB calls inside loop)
            auctions.push({
                auctionProduct: product._id,
                auctioncategory: categoryExists._id, // ✅ Assign category ID
                startingBid: product.sellPrice,
                currentBid: product.sellPrice,
                auctionType: product.auctionType,
                startDate:stateDate,
                endDate:endDate,
                lotNumber: product.lotNumber,
                description:desciptions ,
                createdBy: req.user._id,
                status: status || "ACTIVE",
                catalog:category || "",
                description:desciptions || "No description",
            });
        }));

        // ✅ Bulk insert auctions (Better Performance)
        const createdAuctions = await auctionModel.insertMany(auctions);

        return created(res, `${createdAuctions.length} auctions created successfully.`, createdAuctions);
    } catch (error) {
        console.error("Bulk auction creation error:", error);
        return unknownError(res, error.message);
    }
};


 export const winner = async (req, res) => {
    try{

    }catch(error){

    }
 }



 export const getWinners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const search = req.query.search || ""; // Get search query from request

        const winners = await auctionModel.aggregate([
            {
                $match: { winner: { $ne: null } }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'winner',
                    foreignField: '_id',
                    as: 'winnerDetails'
                }
            },
            {
                $unwind: '$winnerDetails'
            },
            {
                $lookup: {
                    from: 'auctionproducts',
                    localField: 'auctionProduct',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    winningBid: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$bids",
                                    as: "bid",
                                    cond: { $eq: ["$$bid.bidder", "$winner"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { 'product.title': { $regex: search, $options: 'i' } },
                        { 'winnerDetails.name': { $regex: search, $options: 'i' } },
                        { 'winnerDetails.email': { $regex: search, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    product: {
                        title: 1,
                        price: 1,
                        image: 1
                    },
                    auctionDetails: {
                        startingBid: 1,
                        currentBid: 1,
                        description: 1,
                        lotNumber: 1,
                        auctionType: 1,
                        startDate: 1,
                        endDate: 1,
                        status: 1
                    },
                    winner: {
                        _id: "$winnerDetails._id",
                        name: "$winnerDetails.name",
                        email: "$winnerDetails.email"
                    },
                    winningBid: {
                        bidAmount: "$winningBid.bidAmount",
                        bidTime: "$winningBid.bidTime",
                        ipAddress: "$winningBid.ipAddress" // Include IP address
                    }
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);

        const total = await auctionModel.countDocuments({ winner: { $ne: null } });

        res.json({
            success: true,
            message: 'Winners retrieved successfully',
            winners,
            total,
            page,
            limit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};




// (async () => {
//     try {
//         await auctionModel.collection.dropIndex("lotNumber_1");
//         console.log("✅ Dropped unique index on lotNumber.");
//     } catch (err) {
//         console.log("ℹ️ Index not found or already removed:", err);
//     }
// })();






