import express from "express";
import { createRole, getAllRoles,getAllPermissions, getSingleRole , updateRole , deleteRole} from "../../controllers/RolePermissionController/role-permissions.controller.js"
import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated , authorizeRoles('ADMIN') , createRole);
router.get("/all",IsAuthenticated , authorizeRoles('ADMIN'), getAllRoles);
router.get("/all-permissions",IsAuthenticated , authorizeRoles('ADMIN'), getAllPermissions);
router.get("/:id",IsAuthenticated , getSingleRole);
router.put("/update/:id", IsAuthenticated , authorizeRoles('ADMIN') , updateRole);
router.delete("/delete/:id", IsAuthenticated , authorizeRoles('ADMIN') , deleteRole);



export default router;