import express from "express";
import { createUser,  updateUser , deleteUser} from "../../controllers/UserController/user.controller.js"
import { IsAuthenticated , authorizeRoles, authorizePermission, authorizeBackendRole} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated  ,  authorizeBackendRole, createUser);
router.put("/update/:id", IsAuthenticated  ,authorizeBackendRole,  updateUser);
router.delete("/delete/:id", IsAuthenticated  ,authorizeBackendRole,  deleteUser);

export default router;