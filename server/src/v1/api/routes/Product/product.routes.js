import express from "express";
import mongoose from "mongoose";
const router = express.Router();

import { createProduct , getFilteredProducts , updateProduct , deleteProduct , getProductById  , bulkDeleteProducts} from "../../controllers/ProductController/product.controller.js";


// Create a new product
router.post("/create", createProduct);
router.get("/filter", getFilteredProducts);
router.put("/update/:productId", updateProduct);
router.delete("/delete/:productId", deleteProduct);
router.get("/:productId", getProductById);
router.post("/bulkdelete" , bulkDeleteProducts)
export default router;
// Compare this snippet from Auctions-main/server/src/v1/api/controllers/UploadImageController/uploadController.js: