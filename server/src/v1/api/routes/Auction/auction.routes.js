import express from "express";
const router = express.Router();

import {
    createAuction,
    getAuctions,
    joinAuction,
    AddBalance,
    updatePaymentStatus,
    getAuctionById,
    updateAuction,
    deleteAuction,
    placeBid,
    getAuctionDetails,
    getUserAuctions,
    getDashboardStats
    // stripeWebhook
} from "../../controllers/AuctionController/auction.controller.js";
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"

router.post("/create", IsAuthenticated ,  authorizeRoles(
    'ADMIN'
) , createAuction);

router.get("/all", getAuctions);

// get actions by id //

router.get("/getbyId/:id" , getAuctionById)

// Join Auction //

router.post("/join", IsAuthenticated , joinAuction);

// Add the balanace //

router.post("/addBalance" , IsAuthenticated , AddBalance)


// Stripe Webhook //

    

// update payment status //

router.post("/updatePaymentStatus"  , updatePaymentStatus)

// update auction //

router.post("/update/:id" , IsAuthenticated , authorizeRoles("ADMIN") , updateAuction)

// delete auction //

router.post("/delete" , IsAuthenticated , authorizeRoles("ADMIN") , deleteAuction)

// place bid //

router.post("/placeBid" , IsAuthenticated , placeBid)

router.get("/getAuctionDetails/:auctionId" , IsAuthenticated , authorizeRoles("ADMIN") ,  getAuctionDetails)

router.get("/getUserAuctions" , IsAuthenticated , getUserAuctions)

router.get("/getDashboardStats" , IsAuthenticated , authorizeRoles("ADMIN") , getDashboardStats)

// router.post("/stripe-webhook" , express.raw({type: 'application/json'}) , stripeWebhook)

export default router;