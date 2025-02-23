import express from 'express'
import {createOrder , Orderwebhook} from "../../controllers/OrderController/order.controller.js"
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"
const router = express.Router();

router.post("/MakeOrder" , IsAuthenticated ,  createOrder)


export default router;