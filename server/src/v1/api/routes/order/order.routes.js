import express from 'express'
import {createOrder  , getAllOrders , updateOrderStatus , getOrdersByUserId , deleteOrders} from "../../controllers/OrderController/order.controller.js"
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"
const router = express.Router();

router.post("/MakeOrder" , IsAuthenticated ,  createOrder)
router.get("/getAllOrders" , getAllOrders)
router.post("/updateOrderStatus" , updateOrderStatus)
router.get("/getOrdersById/:userId" , getOrdersByUserId)
router.post("/deleteOrders" , deleteOrders)



export default router;