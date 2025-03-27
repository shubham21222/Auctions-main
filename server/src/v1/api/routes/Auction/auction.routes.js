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
    getDashboardStats,
    setBidIncrement,
    getBidIncrement,
    createBulkAuction,
    getbulkAuctions,
    getbulkAuctionById
    // stripeWebhook
} from "../../controllers/AuctionController/auction.controller.js";
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"

router.post("/create", IsAuthenticated ,  authorizeRoles(
    'ADMIN'
) , createAuction);

router.post("/bulkCreate", IsAuthenticated , authorizeRoles("ADMIN") , createBulkAuction)

router.get("/all", getAuctions);

router.get("/bulk" , getbulkAuctions)

// get actions by id //

router.get("/getbyId/:id" , getAuctionById)

// get auction by builk //

router.get("/bulkgetbyId/:id" , getbulkAuctionById)

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


// Bid Increment //

router.post("/setBidIncrement"  , setBidIncrement)

router.get("/getBidIncrement" , getBidIncrement)

export default router;