import express from "express";
import upload from "../../middlewares/multer.js";
import { uploadImage } from "../../controllers/UploadImageController/uploadController.js";

const router = express.Router();


// Single file upload
router.post("/upload", upload.single("image"), uploadImage);

export default router;