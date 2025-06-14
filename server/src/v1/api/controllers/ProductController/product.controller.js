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
import categoryModel from "../../models/Category/category.model.js";




// Create a new product


    // export const createProduct = async (req, res) => {
    //     try {
    //         // Check if the request body is an array or single object
    //         const productsData = Array.isArray(req.body) ? req.body : [req.body];
            
    //         // Array to store created products
    //         const createdProducts = [];
            
    //         // Check for existing titles
    //         const existingTitles = await ProductModel.find({
    //             title: { $in: productsData.map(product => product.title) }
    //         });
    //         const existingTitleSet = new Set(existingTitles.map(product => product.title));
    //         // Validate and create products
    //         for (const productData of productsData) {
    //             const { 
    //                 title, 
    //                 price, 
    //                 estimateprice, 
    //                 offerAmount, 
    //                 category, 
    //                 image, 
    //                 status, 
    //                 sortByPrice, 
    //                 description, 
    //                 created_at, 
    //                 details,
    //                 link
    //             } = productData;

    //             // Skip if title already exists
    //             if (existingTitleSet.has(title)) {
    //                 continue; // Skip this product if title exists
    //             }

    //             // Create new product
    //             const product = new ProductModel({
    //                 title,
    //                 link,
    //                 price,
    //                 estimateprice,
    //                 offerAmount,
    //                 category,
    //                 image,
    //                 status,
    //                 sortByPrice,
    //                 description,
    //                 created_at: created_at || Date.now(),
    //                 details
    //             });

    //             const savedProduct = await product.save();
    //             createdProducts.push(savedProduct);
    //         }

    //         if (createdProducts.length === 0) {
    //             return badRequest(res, "No products were created. All submitted titles may already exist.");
    //         }

    //         return success(res, `Successfully created ${createdProducts.length} product(s)`, createdProducts);
    //     } catch (error) {
    //         return unknownError(res, error.message);
    //     }
    // };

    // Add new function to generate SKU
    const generateSKU = async (category) => {
        try {
            // Get the first letter of the category name as prefix
            // Remove any spaces and special characters, and take the first letter
            const prefix = category
                .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters and spaces
                .substring(0, 1) // Take first letter
                .toUpperCase(); // Convert to uppercase

            if (!prefix) {
                throw new Error('Invalid category name for SKU generation');
            }

            // Find the last product with a SKU matching the pattern NY[prefix]XXXXXX
            const lastProduct = await ProductModel.findOne({ 
                sku: { $regex: new RegExp(`^NY${prefix}`) } 
            }).sort({ sku: -1 });

            let newSKU;
            if (lastProduct && lastProduct.sku) {
                // Extract the number from the last SKU
                const lastNumber = parseInt(lastProduct.sku.slice(3)); // Remove 'NY' and prefix
                newSKU = `NY${prefix}${(lastNumber + 1).toString().padStart(6, '0')}`;
            } else {
                // If no existing SKU for this category, start with 000001
                newSKU = `NY${prefix}000001`;
            }

            return newSKU;
        } catch (error) {
            console.error('Error generating SKU:', error);
            throw error;
        }
    };

    export const createProduct = async (req, res) => {
        try {
            // Check if the request body is an array or single object
            const productsData = Array.isArray(req.body) ? req.body : [req.body];
    
            // Array to store created products
            const createdProducts = [];
    
            // Create and save each product
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
                    details,
                    link
                } = productData;
    
                // Get category name from category ID
                const categoryDoc = await categoryModel.findById(category);
                if (!categoryDoc) {
                    return badRequest(res, `Category not found for ID: ${category}`);
                }
    
                // Generate SKU with category name
                const sku = await generateSKU(categoryDoc.name);
    
                const product = new ProductModel({
                    title,
                    link,
                    sku, // Add the generated SKU
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
    
            return success(res, `Successfully created ${createdProducts.length} product(s)`, createdProducts);
        } catch (error) {
            return unknownError(res, error.message);
        }
    };
    


// get all products

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getFilteredProducts = async (req, res) => {
    try {
        const { 
            category, 
            status, 
            sortByPrice, 
            sortField, 
            sortOrder, 
            searchQuery,
            sku,
            page = 1,
            limit = 10
        } = req.query;

        // Build match stage
        let matchStage = {};
        if (category) {
            const categoryArray = category.split(",");
            for (const id of categoryArray) {
                if (!isValidObjectId(id.trim())) {
                    return badRequest(res, `Invalid category ID: ${id}`, "Invalid ObjectId");
                }
            }
            matchStage.category = {
                $in: categoryArray.map(id => new mongoose.Types.ObjectId(id.trim()))
            };
        }
        if (status) {
            matchStage.status = status;
        }
        if (sku) {
            const escapedSku = escapeRegExp(sku);
            matchStage.sku = { $regex: `^${escapedSku}$`, $options: "i" };
        }

        // Build search conditions if searchQuery exists
        if (searchQuery) {
            const escapedQuery = escapeRegExp(searchQuery.trim());
            const searchWords = escapedQuery.split(/\s+/).filter(word => word.length > 0);
            
            const searchConditions = searchWords.map(word => ({
                $or: [
                    { title: { $regex: `\\b${word}\\b`, $options: 'i' } },
                    { title: { $regex: `^${word}\\b`, $options: 'i' } },
                    { title: { $regex: `\\b${word}$`, $options: 'i' } },
                    { description: { $regex: `\\b${word}\\b`, $options: 'i' } },
                    { description: { $regex: `^${word}\\b`, $options: 'i' } },
                    { description: { $regex: `\\b${word}$`, $options: 'i' } }
                ]
            }));

            matchStage.$and = searchConditions;
        }

        // Build the aggregation pipeline
        const pipeline = [
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
            // Add a random field for complete shuffling
            {
                $addFields: {
                    randomSort: { $rand: {} }
                }
            },
            {
                $project: {
                    title: 1,
                    sku: 1,
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
                    link: 1,
                    category: 1,
                    randomSort: 1,
                    // Add a computed field for sorting
                    priceValue: {
                        $cond: {
                            if: {
                                $regexMatch: {
                                    input: "$estimateprice",
                                    regex: "^\\$\\d+\\.?\\d*\\s*-\\s*\\$\\d+\\.?\\d*$"
                                }
                            },
                            then: {
                                $toDouble: {
                                    $substr: [
                                        { $arrayElemAt: [{ $split: ["$estimateprice", " - "] }, 0] },
                                        1,
                                        -1
                                    ]
                                }
                            },
                            else: 0
                        }
                    }
                }
            }
        ];

        // Add sorting only if not shuffling (i.e., when search query or specific sort is requested)
        let sortOptions = {};
        if (searchQuery) {
            // Remove random sort and just use createdAt for search results
            sortOptions = { created_at: -1 };
        } else if (sortByPrice === "High Price" || sortByPrice === "Low Price") {
            sortOptions = { priceValue: sortByPrice === "High Price" ? -1 : 1 };
        } else if (sortField && sortOrder) {
            // Ensure sortField is a valid field name
            const validSortFields = ['title', 'price', 'estimateprice', 'created_at', 'updated_at', 'sku'];
            if (validSortFields.includes(sortField)) {
                sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };
            } else {
                // Default to created_at if invalid sort field
                sortOptions = { created_at: -1 };
            }
        } else {
            // If no specific sort is requested, use complete random shuffle
            sortOptions = { randomSort: 1 };
        }

        // Add sort stage if we have sort options
        if (Object.keys(sortOptions).length > 0) {
            pipeline.push({ $sort: sortOptions });
        }

        // Execute aggregation with pagination
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            customLabels: {
                totalDocs: 'total',
                docs: 'items',
                limit: 'limit',
                page: 'page',
                totalPages: 'totalPages',
                pagingCounter: 'pagingCounter',
                hasPrevPage: 'hasPrevPage',
                hasNextPage: 'hasNextPage',
                prevPage: 'prevPage',
                nextPage: 'nextPage'
            }
        };

        const result = await ProductModel.aggregatePaginate(pipeline, options);

        // Remove the temporary fields from the results
        result.items = result.items.map(({ priceValue, randomSort, ...item }) => item);

        return success(res, "Products fetched successfully", result);

    } catch (error) {
        console.error("GetFilteredProducts Error:", error);
        return unknownError(res, error.message || "Failed to fetch filtered products");
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



// bulkDeleteProducts //

export const bulkDeleteProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        // Validate input
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return badRequest(res, "Please provide an array of product IDs to delete.");
        }

        // Delete products by IDs
        const deleteResult = await ProductModel.deleteMany({
            _id: { $in: productIds }
        });

        if (deleteResult.deletedCount === 0) {
            return badRequest(res, "No products were deleted. Check if the provided IDs exist.");
        }

        return success(res, `Successfully deleted ${deleteResult.deletedCount} product(s).`);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

export const adjustAllEstimatePricesByPercentage = async (req, res) => {
    try {
        const { percentage } = req.body;

        // Validate percentage
        if (typeof percentage !== "number" || isNaN(percentage)) {
            return badRequest(res, "Percentage must be a valid number");
        }

        // Limit percentage range (e.g., -100% to +100%)
        if (Math.abs(percentage) > 100) {
            return badRequest(res, "Percentage cannot exceed ±100%");
        }

        // Find all products
        const products = await ProductModel.find({});

        if (products.length === 0) {
            return badRequest(res, "No products found to update");
        }

        // Update estimate price for each product
        const updatedProducts = [];
        for (const product of products) {
            // Parse estimateprice range (e.g., "$1275 - $1870")
            const priceRange = product.estimateprice.replace(/\$/g, "").split(" - ").map(str => str.trim());
            if (priceRange.length !== 2) {
                return badRequest(res, `Invalid estimate price format for product: ${product.title}`);
            }

            const [minPrice, maxPrice] = priceRange.map(parseFloat);
            if (isNaN(minPrice) || isNaN(maxPrice)) {
                return badRequest(res, `Invalid estimate price format for product: ${product.title}`);
            }

            // Calculate new estimate prices
            const newMinPrice = minPrice * (1 + percentage / 100);
            const newMaxPrice = maxPrice * (1 + percentage / 100);

            // Ensure estimate prices are non-negative
            if (newMinPrice < 0 || newMaxPrice < 0) {
                return badRequest(res, `Cannot set negative estimate price for product: ${product.title}`);
            }

            // Format new estimateprice (e.g., "$1372.5 - $2057")
            product.estimateprice = `$${newMinPrice.toFixed(2)} - $${newMaxPrice.toFixed(2)}`;
            product.updated_at = Date.now();
            const savedProduct = await product.save();
            updatedProducts.push(savedProduct);
        }

        return success(res, `Successfully updated estimate prices for ${updatedProducts.length} product(s)`, updatedProducts);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


export const getProductBySku = async (req, res) => {
    try {
        const { sku } = req.query;
        if (!sku) {
            return badRequest(res, "SKU is required");
        }
        // Escape special characters in SKU
        const escapedSku = escapeRegExp(sku);
        const products = await ProductModel.find({ 
            sku: { $regex: `^${escapedSku}$`, $options: "i" } 
        })
        .populate({ path: "category", select: "name", strictPopulate: false })
        .lean(); // Use lean for performance
        if (products.length === 0) {
            return success(res, "No products found with this SKU", []);
        }
        return success(res, `Found ${products.length} product(s) with SKU ${sku}`, products);
    } catch (error) {
        console.error("GetProductBySku Error:", error);
        return unknownError(res, error.message || "Failed to fetch product by SKU");
    }
};