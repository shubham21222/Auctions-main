import {
    success,
    unknownError
} from "../../../../../src/v1/api/formatters/globalResponse.js";
import ProductModel from "../../models/Products/product.model.js";

// Simple fast endpoint for initial product loading
export const getProductsFast = async (req, res) => {
    try {
        const { 
            page = 1,
            limit = 24
        } = req.query;

        // Simple query without complex aggregation for faster response
        const products = await ProductModel.find({})
            .populate("category", "name")
            .select("title sku description price estimateprice offerAmount image status created_at category")
            .sort({ created_at: -1 })
            .limit(parseInt(limit) * parseInt(page))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean(); // Use lean for better performance

        // Get total count separately for better performance
        const total = await ProductModel.countDocuments({});

        const result = {
            items: products,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        };

        return success(res, "Products fetched successfully", result);

    } catch (error) {
        console.error("GetProductsFast Error:", error);
        return unknownError(res, error.message || "Failed to fetch products");
    }
};
