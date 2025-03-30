import express from "express";
import { createCategory, getAllCategories, getSingleCategory , updateCategory , deleteCategory} from "../../controllers/categoryController/category.controller.js"
import { IsAuthenticated , authorizeRoles, authorizePermission, authorizeBackendRole} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated , authorizeBackendRole , createCategory);
router.get("/all", getAllCategories);
router.get("/:id", getSingleCategory);
router.put("/update/:id", IsAuthenticated , authorizeBackendRole , updateCategory);
router.delete("/delete/:id", IsAuthenticated , authorizeBackendRole , deleteCategory);





export default router;