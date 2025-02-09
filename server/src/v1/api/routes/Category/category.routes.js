import express from "express";
import { createCategory, getAllCategories, getSingleCategory , updateCategory , deleteCategory} from "../../controllers/categoryController/category.controller.js"
import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated , authorizeRoles('ADMIN') , createCategory);
router.get("/all", getAllCategories);
router.get("/:id", getSingleCategory);
router.put("/update/:id", IsAuthenticated , authorizeRoles('ADMIN') , updateCategory);
router.delete("/delete/:id", IsAuthenticated , authorizeRoles('ADMIN') , deleteCategory);





export default router;