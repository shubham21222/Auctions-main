import express from 'express';
const router = express.Router();
import { createNewsletter , getAllNewsletters  , getNewsletterById , updateNewsletterById , deleteNewsletterById} from "../../controllers/newLetterController/newsletter.controller.js"
import { IsAuthenticated ,  authorizeRoles, authorizeBackendRole} from  "../../middlewares/authicationmiddleware.js"


// create newsletter //
router.post("/create",  createNewsletter);
// get all newsletters //

router.get("/all", getAllNewsletters);

// get newsletter by id //

router.get("/:id", getNewsletterById);

// update newsletter by id //

router.post("/:id", updateNewsletterById);


// delete newsletter by id //
router.post("/delete/:id", deleteNewsletterById);


export default router;



