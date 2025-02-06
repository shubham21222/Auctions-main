import express from "express";
import  {register, login , logout , verifyUser}  from  "../../controllers/AuthController/auth.controller.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify/:token", verifyUser);


export default router;