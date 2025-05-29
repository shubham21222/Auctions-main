import express from "express";
import {
    createSeller,
    getAllSellers,
    getSellerById,
    approveSeller,
    updateSeller,
    deleteSeller,
    getSellersByCreatedBy
} from "../../controllers/SellerController/seller.controller.js";
import { IsAuthenticated ,  authorizeRoles, authorizeBackendRole} from  "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated ,createSeller);
router.get("/all", IsAuthenticated , authorizeBackendRole , getAllSellers);
router.get("/getbyid/:id", IsAuthenticated , getSellerById);
router.post("/approve", IsAuthenticated , authorizeBackendRole ,approveSeller);
router.post("/update/:id", IsAuthenticated, updateSeller);
router.post("/delete/:id", IsAuthenticated , authorizeBackendRole , deleteSeller);
router.get("/getByCreatedBy", IsAuthenticated , getSellersByCreatedBy);

export default router;
