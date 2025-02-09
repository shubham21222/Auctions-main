import express from "express";
import  {register, login , logout , verifyUser , forgotPassword , resetPassword , updateProfile , updatePassword}  from  "../../controllers/AuthController/auth.controller.js";
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify/:token", verifyUser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);
router.post("/updateProfile",  IsAuthenticated , authorizeRoles('USER') ,updateProfile);
router.post("/updatePassword",  IsAuthenticated , authorizeRoles('USER') ,updatePassword);


export default router;