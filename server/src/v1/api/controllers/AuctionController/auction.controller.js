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
import mongoose from "mongoose"


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

        console.log(matchStage)


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

        return success(res, 'Auctions retrieved successfully.', auctions);
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return unknownError(res, error.message);
    }
};
