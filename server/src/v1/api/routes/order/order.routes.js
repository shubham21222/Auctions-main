import express from 'express'
import {createOrder , Orderwebhook , getAllOrders} from "../../controllers/OrderController/order.controller.js"
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"
const router = express.Router();

router.post("/MakeOrder" , IsAuthenticated ,  createOrder)
router.get("/getAllOrders" , getAllOrders)



export default router;