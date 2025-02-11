import express from "express";
import upload from "../../middlewares/multer.js";
import { uploadImage , uploadMultipleImages } from "../../controllers/UploadImageController/uploadController.js";

const router = express.Router();


// Single file upload
router.post("/upload", upload.single("image"), uploadImage);

// Multiple files upload
router.post("/upload-multiple", upload.array("image", 10), uploadMultipleImages);

export default router;