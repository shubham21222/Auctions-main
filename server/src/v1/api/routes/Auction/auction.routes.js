import express from "express";
const router = express.Router();

import {
    createAuction,
    getAuctions
} from "../../controllers/AuctionController/auction.controller.js";
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"

router.post("/create", IsAuthenticated ,  authorizeRoles(
    'ADMIN'
) , createAuction);

router.get("/all", getAuctions);


export default router;