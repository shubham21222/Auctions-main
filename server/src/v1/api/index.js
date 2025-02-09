import { Router } from 'express';
import User from "./routes/Auth/Auth.routes.js";
import Category from "./routes/Category/category.routes.js";



const router = Router();


// Add API routes here for REGISTER //

router.use("/auth", User);


// Add API routes here for CATEGORY //
router.use("/category", Category);






export default router;