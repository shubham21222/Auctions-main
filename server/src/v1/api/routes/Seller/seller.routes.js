import express from "express";
import {
    createSeller,
    getAllSellers,
    getSellerById,
    approveSeller,
    updateSeller,
    deleteSeller
} from "../../controllers/SellerController/seller.controller.js";
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated ,createSeller);
router.get("/all", IsAuthenticated , authorizeRoles('ADMIN') , getAllSellers);
router.get("/getbyid/:id", IsAuthenticated , getSellerById);
router.post("/approve", IsAuthenticated , authorizeRoles('ADMIN') ,approveSeller);
router.post("/update/:id", updateSeller);
router.post("/delete/:id", IsAuthenticated , authorizeRoles('ADMIN') , deleteSeller);

export default router;
