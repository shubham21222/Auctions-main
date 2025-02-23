import { Router } from 'express';
import User from "./routes/Auth/Auth.routes.js";
import Category from "./routes/Category/category.routes.js";
import  uploadImage  from "./routes/upload/uploadRoutes.js";
import Products  from "./routes/Product/product.routes.js"
import favorite from "./routes/Favorite/favorite.routes.js";
import Auction from "./routes/Auction/auction.routes.js";
import Order from "./routes/order/order.routes.js"

const router = Router();


// Add API routes here for REGISTER //

router.use("/auth", User);


// Add API routes here for CATEGORY //
router.use("/category", Category);


// Add API routes here for UPLOAD //
router.use("/uploadImg", uploadImage);


// Add API routes here for PRODUCT //
router.use("/product", Products);


// Add API routes here for FAVORITE //

router.use("/favorite", favorite);


// Add API routes here for AUCTION //
router.use("/auction", Auction);


// Add API routes here for Order //

router.use("/order" , Order)






export default router;