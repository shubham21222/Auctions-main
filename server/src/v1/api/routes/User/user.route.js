import express from "express";
import { createUser,  updateUser , deleteUser} from "../../controllers/UserController/user.controller.js"
import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated  , createUser);
router.put("/update/:id", IsAuthenticated  , updateUser);
router.delete("/delete/:id", IsAuthenticated  , deleteUser);

export default router;