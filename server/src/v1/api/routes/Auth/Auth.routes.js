import express from "express";
import  {register,sendVerificationMail,verifyMail, login , logout , verifyUser , forgotPassword , resetPassword , updateProfile , updatePassword , updateBillingAddress , getAllUsers , getUserById , getUserByBillingAddress, addCard, checkEmailExists}  from  "../../controllers/AuthController/auth.controller.js";
import { IsAuthenticated ,  authorizeRoles, authorizePermission, authorizeBackendRole} from  "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/register", register);
router.post("/send-verification-mail", sendVerificationMail);
router.post("/verify-email", verifyMail);
router.post("/add-card",IsAuthenticated , authorizeRoles('USER'), addCard);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify/:token", verifyUser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);
router.post("/updateProfile",  IsAuthenticated , authorizeRoles('USER') ,updateProfile);
router.post("/updatePassword",  IsAuthenticated , authorizeRoles('USER') ,updatePassword);
router.post("/UpdateBillingAddress" , IsAuthenticated , updateBillingAddress)
router.get("/getAllUsers", IsAuthenticated , authorizeBackendRole , getAllUsers);
router.get("/getUserById/:id", IsAuthenticated  , getUserById);
router.get("/getUserByBillingAddress/:id" , getUserByBillingAddress);
router.post("/check-email", checkEmailExists);

export default router;