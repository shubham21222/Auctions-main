import { Router } from 'express';
import User from "./routes/Auth/Auth.routes.js";



const router = Router();


// Add API routes here for REGISTER //

router.use("/auth", User);






export default router;