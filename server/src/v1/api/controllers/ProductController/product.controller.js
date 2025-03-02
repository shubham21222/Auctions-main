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
    onError,
    isValidObjectId
} from "../../../../../src/v1/api/formatters/globalResponse.js";
import favorite from "../../models/Favorite/favorite.js";
import ProductModel from "../../models/Products/product.model.js"
import auctionModel from "../../models/Auction/auctionModel.js";
import mongoose from "mongoose";




// Create a new product


export const createProduct = async (req, res) => {
    try {
        // Check if the request body is an array or single object
        const productsData = Array.isArray(req.body) ? req.body : [req.body];
        
        // Array to store created products
        const createdProducts = [];
        
        // Check for existing titles
        const existingTitles = await ProductModel.find({
            title: { $in: productsData.map(product => product.title) }
        });
        
        const existingTitleSet = new Set(existingTitles.map(product => product.title));
        
        // Validate and create products
        for (const productData of productsData) {
            const { 
                title, 
                price, 
                estimateprice, 
                offerAmount, 
                category, 
                image, 
                status, 
                sortByPrice, 
                description, 
                created_at, 
                details 
            } = productData;

            // Skip if title already exists
            if (existingTitleSet.has(title)) {
                continue; // Skip this product if title exists
            }

            // Create new product
            const product = new ProductModel({
                title,
                price,
                estimateprice,
                offerAmount,
                category,
                image,
                status,
                sortByPrice,
                description,
                created_at: created_at || Date.now(),
                details
            });

            const savedProduct = await product.save();
            createdProducts.push(savedProduct);
        }

        if (createdProducts.length === 0) {
            return badRequest(res, "No products were created. All submitted titles may already exist.");
        }

        return success(res, `Successfully created ${createdProducts.length} product(s)`, createdProducts);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


// get all products


export const getFilteredProducts = async (req, res) => {
    try {
        const { 
            category, 
            status, 
            sortByPrice, 
            sortField, 
            sortOrder, 
            searchQuery,
            page = 1,    // Default to page 1
            limit = 10    // Default to 9 items per page
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit); // Calculate skip for pagination

        let matchStage = {};

        // Filter by multiple categories
        if (category) {
            const categoryArray = category.split(",");
            matchStage.category = {
                $in: categoryArray.map(id => {
                    if (!isValidObjectId(id.trim())) throw new Error(`Invalid category ID: ${id}`);
                    return new mongoose.Types.ObjectId(id.trim());
                })
            };
        }

        // Filter by status
        if (status) {
            matchStage.status = status;
        }

        // Search filter
        if (searchQuery) {
            matchStage.$or = [
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } }
            ];
        }

        let sortStage = {};
        if (sortByPrice) {
            sortStage.price = sortByPrice === "High Price" ? -1 : 1;
        } else if (sortField && sortOrder) {
            if (sortField === "title") {
                sortStage.title = sortOrder === "asc" ? 1 : -1;
            } else if (sortField === "created_at") {
                sortStage.created_at = sortOrder === "asc" ? 1 : -1;
            }
        } else {
            sortStage.created_at = -1; // Default to newest first
        }
        
        // do not include whihch producrs that is in the auction //

        const auctionProducts = await auctionModel.find({}).select("product");
        const auctionProductIds = auctionProducts.map(auction => auction.product);
        if (auctionProductIds.length > 0) {
            matchStage._id = { $nin: auctionProductIds };
        }
        

        // Aggregation pipeline with pagination
        const products = await ProductModel.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            { $sort: sortStage },
            { $skip: skip },        // Skip for pagination
            { $limit: parseInt(limit) }, // Limit for pagination
            {
                $project: {
                    title: 1,
                    description: 1,
                    price: 1,
                    estimateprice: 1,
                    offerAmount: 1,
                    image: 1,
                    status: 1,
                    sortByPrice: 1,
                    created_at: 1,
                    updated_at: 1,
                    details: 1,
                    favorite: 1,
                    category: { _id: 1, name: 1 }
                }
            }
        ]).allowDiskUse(true); // Enable external sorting

        // Get total count for pagination (optional, remove if not needed)
        const total = await ProductModel.countDocuments(matchStage);

        return success(res, "Products fetched successfully", { 
            items: products,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
};


// Update a product //
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updatedData = req.body;

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            updatedData,
            { new: true, runValidators: true } // Returns updated document & validates fields
        );

        if (!updatedProduct) {
            return badRequest(res, "Product not found");
        }

        return success(res, "Product updated successfully", updatedProduct);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


// delete a product //

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const deletedProduct = await ProductModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return badRequest(res, "Product not found");
        }

        return success(res, "Product deleted successfully");
    } catch (error) {
        return unknownError(res, error.message);
    }
};


// get a product by id //

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await ProductModel.findById(productId)
        .populate("category", "name");

        if (!product) {
            return success(res, "Product not found");
        }

        return success(res, "Product retrieved successfully", product);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

