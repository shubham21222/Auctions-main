import { Router } from 'express';
import User from "./routes/Auth/Auth.routes.js";
import Category from "./routes/Category/category.routes.js";
import  uploadImage  from "./routes/upload/uploadRoutes.js";
import Products  from "./routes/Product/product.routes.js"
import favorite from "./routes/Favorite/favorite.routes.js";
import Auction from "./routes/Auction/auction.routes.js";
import Order from "./routes/order/order.routes.js"
import seller from "./routes/Seller/seller.routes.js"
import artist from "./routes/Artist/artist.routes.js"
import brands from "./routes/brands/brands.routes.js";
import rolePermissions from "./routes/RolePermission/role-permissions.route.js";

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

// Add API routes here for Seller //

router.use("/seller", seller);


// Add API routes here for Artist //

router.use("/artist", artist);

// Add API routes here for Brands //

router.use("/brands", brands);

router.use("/role", rolePermissions);






export default router;