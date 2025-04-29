import express from 'express'
import {createOrder  , getAllOrders , updateOrderStatus , getOrdersByUserId , deleteOrders , UpdateShipping} from "../../controllers/OrderController/order.controller.js"
import { IsAuthenticated, authorizeBackendRole } from "../../middlewares/authicationmiddleware.js";
const router = express.Router();

router.post("/MakeOrder" , IsAuthenticated ,  createOrder)
router.get("/getAllOrders" , getAllOrders)
router.post("/updateOrderStatus" , updateOrderStatus)
router.get("/getOrdersById/:userId" , getOrdersByUserId)
router.post("/deleteOrders" , deleteOrders)
router.post("/Updatepaymentstatus" , IsAuthenticated, authorizeBackendRole , UpdateShipping)



export default router;