import express from "express";
import mongoose from "mongoose";

const router = express.Router();

import {
    createProduct,
    getFilteredProducts,
    updateProduct,
    deleteProduct,
    getProductById,
    bulkDeleteProducts,
    adjustAllEstimatePricesByPercentage,
    getProductBySku // Added new endpoint
} from "../../controllers/ProductController/product.controller.js";

import { IsAuthenticated, authorizeBackendRole } from "../../middlewares/authicationmiddleware.js";

// Routes
router.post("/create", IsAuthenticated, authorizeBackendRole, createProduct);
router.get("/filter", getFilteredProducts);
router.put("/update/:productId", IsAuthenticated, authorizeBackendRole, updateProduct);
router.delete("/delete/:productId", IsAuthenticated, authorizeBackendRole, deleteProduct);
router.get("/:productId", getProductById);
router.post("/bulkdelete", IsAuthenticated, authorizeBackendRole, bulkDeleteProducts);
router.patch("/adjust-all-estimate-prices", IsAuthenticated, authorizeBackendRole, adjustAllEstimatePricesByPercentage);
router.get("/sku", getProductBySku); // New route for SKU search

export default router;