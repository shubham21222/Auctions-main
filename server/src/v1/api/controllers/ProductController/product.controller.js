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
import ProductModel from "../../models/Products/product.model.js"
import mongoose from "mongoose";


// Create a new product


export const createProduct = async (req, res) => {
    try {
        const { title, price, estimateprice, offerAmount, category, image, status, sortByPrice, description, created_at , details} = req.body;

        const existingProduct = await ProductModel.findOne({ title });
        if (existingProduct) {
            return badRequest(res, "A product with this title already exists. Please use a different title.");
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
            created_at,
            details
        });

        await product.save();
        return success(res, "Product created successfully", product);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


// get all products


export const getFilteredProducts = async (req, res) => {
    try {
        const { category, status, sortByPrice, sortField, sortOrder, searchQuery } = req.query;

        let matchStage = {};

        // Filter by multiple categories (if provided)
        if (category) {
            const categoryArray = category.split(","); // Accepts multiple categories as CSV
            matchStage.category = {
                $in: categoryArray.map(id => new mongoose.Types.ObjectId(id.trim()))
            };
        }


        // Filter by status (if provided)
        if (status) {
            matchStage.status = status;
        }

        // Search filter (title & description)
        if (searchQuery) {
            matchStage.$or = [
                { title: { $regex: searchQuery, $options: "i" } },  // Case-insensitive search in title
                { description: { $regex: searchQuery, $options: "i" } } // Case-insensitive search in description
            ];
        }

        let sortStage = {};

        // Handle sorting by price (High to Low or Low to High)
        if (sortByPrice) {
            sortStage.price = sortByPrice == "High Price" ? -1 : 1;
        }
        // Handle general sorting fields (title, created_at)

        else if (sortField && sortOrder) {
            if (sortField == "title") {
                sortStage.title = sortOrder == "asc" ? 1 : -1; // A-Z or Z-A
            } else if (sortField == "created_at") {
                sortStage.created_at = sortOrder == "asc" ? 1 : -1; // Oldest-Newest or Newest-Oldest
            }
        } else {
            sortStage.created_at = -1; // Default sorting (newest first)
        }


        const products = await ProductModel.aggregate([
            { $match: matchStage },
            { $sort: sortStage },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
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
                    category: {
                        _id: 1,
                        name: 1
                    }
                }
            }
        ]);


        return success(res, "Products fetched successfully", products);
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



