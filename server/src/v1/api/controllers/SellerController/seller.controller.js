import sellerModel from '../../models/seller/seller.model.js';
import userModel from '../../models/Auth/User.js';
import {sendEmail} from "../../Utils/sendEmail.js"
import categoryModel from '../../models/Category/category.model.js'

import {
    success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    isValidObjectId,
    invalid,
    onError
} from "../../formatters/globalResponse.js" 


// create seller //


// export const createSeller = async (req, res) => {
//     try {
//         const { ...data } = req.body;
//         data.createdBy = req.user._id;
//         const createSeller = await sellerModel.create(data);
//         if (createSeller) {
//             return sendResponse(res, created, "Seller created successfully", createSeller);
//         } else {
//             return sendResponse(res, badRequest, "Unable to create seller");
//         }
//     } catch (error) {
//         return unknownError(res, error.message);
//     }
// }


export const createSeller = async (req, res) => {
    try {
        const { ...data } = req.body;
        data.createdBy = req.user._id;

        const createSeller = await sellerModel.create(data);

        if (createSeller) {
            // Respond first
            // sendResponse(res, created, "Seller created successfully", createSeller);
            success(res , "created" ,createSeller )

            // Email sending can happen after response
            setImmediate(async () => {
                try {
                    const user = await userModel.findById(req.user._id).select("name email");

                    const message = `
                    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                      <h2 style="color: #111827; font-size: 20px;">Hello ${user.name || 'Seller'},</h2>
                      
                      <p style="font-size: 16px; line-height: 1.6;">
                        Thank you for your interest in becoming a seller with <strong>NY Elizabeth</strong>.
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6;">
                        We’ve successfully received your details and product information. Our curation team is currently reviewing your submission to ensure it aligns with our brand values and quality standards.
                      </p>
                  
                      <p style="font-size: 16px; line-height: 1.6;">
                        We will be in touch with you shortly regarding the next steps in the process.
                      </p>
                  
                      <p style="font-size: 16px; line-height: 1.6;">
                        In the meantime, if you have any questions or require assistance, feel free to reach out. We're always happy to help.
                      </p>
                  
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
                        Warm regards,<br />
                        Team NY Elizabeth<br />
                      </p>
                    </div>
                  `;
                  
                  
                    await sendEmail({
                        to: user.email,
                        subject: "Thanks for your interest in selling with NY Elizabeth",
                        html: message,
                    });
                } catch (emailError) {
                    console.error("Email sending failed:", emailError.message);
                }
            });

        } else {
            return sendResponse(res, badRequest, "Unable to create seller");
        }
    } catch (error) {
        console.error("Create seller error:", error);
        return unknownError(res, error.message);
    }
};


// get all sellers //

export const getAllSellers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 sellers per page
        const skip = (page - 1) * limit;

        const totalSellers = await sellerModel.countDocuments(); // Total count of sellers

        const allSellers = await sellerModel
            .find()
            .sort({ createdAt: -1 })
            .populate({path: 'category', select: 'name'})
            .populate({path: 'createdBy', select: 'name email'})
            .populate({path: 'ApprovedBy', select: 'name email'})
            .skip(skip)
            .limit(limit);

        if (!allSellers.length) {
            // return sendResponse(res, notFound, "No sellers found");
            return badRequest(res , "No sellers found")
        }

        // return sendResponse(res, "All Sellers", {
        //     sellers: allSellers,
        //     totalSellers,
        //     currentPage: page,
        //     totalPages: Math.ceil(totalSellers / limit),
        // });

        return success(res , "All Sellers" , {
              sellers: allSellers,
            totalSellers,
            currentPage: page,
            totalPages: Math.ceil(totalSellers / limit),
        })


    } catch (error) {
        console.log(error);
        return unknownError(res, error.message);
    }
};



// get seller by id //

export const getSellerById = async (req, res) => {
    try {
        const { id } = req.params;
        const isValidId = await isValidObjectId(res, id);
        if (!isValidId) {
            return badRequest(res, "Invalid seller ID");
        }
        const seller = await sellerModel.findById(id).populate({
            path: 'category',
            select: 'name'
        })
        .populate({
            path: 'createdBy',
            select: 'name email'
        })

        .populate({
            path: 'ApprovedBy',
            select: 'name email'
        })
        if (seller) {
            // return sendResponse(res, success, "Seller", seller);
            return success(res , "Seller" , Seller)
        } else {
            // return sendResponse(res, notFound, "Seller not found");
             return badRequest(res , "not found")
        }
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message);
    }
}


// Approved by admin //

export const approveSeller = async (req, res) => {
    try {
        const Adminid = req.user._id; // Extract user ID correctly

       const {ApprovalByAdmin , id} = req.body;

       isValidObjectId(res, id);

       if(!isValidObjectId){
              return invalid(res, "Invalid seller ID");
       }
       if (!ApprovalByAdmin) {
           return invalid(res, "Approval status is required");
       }

        const seller = await sellerModel.findByIdAndUpdate(
            id,
            { Approved: ApprovalByAdmin, ApprovedBy: Adminid },
            { new: true }
        );

        if (!seller) {
            // return sendResponse(res, notFound, "Seller not found");
            return badRequest(res , "seller not found")
        }

       return created(res, "Seller approved successfully", seller);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


// update seller //

export const updateSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const isValidId = await isValidObjectId(res, id);
        if (!isValidId) {
            return badRequest(res, "Invalid seller ID");
        }
        const updatedSeller = await sellerModel.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (updatedSeller) {
            // return sendResponse(res, success, "Seller updated successfully", updatedSeller);
            return success(res , "Seller updated successfully" , updatedSeller)
        } else {
            return badRequest(res , "seller not updated")
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// delete seller //

export const deleteSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const isValidId = await isValidObjectId(res, id);
        if (!isValidId) {
            return badRequest(res, "Invalid seller ID");
        }
        const deletedSeller = await sellerModel.findByIdAndDelete(id);
        if (deletedSeller) {
            // return sendResponse(res, success, "Seller deleted successfully");
            return success(res , "Seller deleted successfully")
        } else {
            // return sendResponse(res, notFound, "Seller not found");
            return badRequest(res , "seller not found")
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// get all sellers specific with created by //


export const getSellersByCreatedBy = async (req, res) => {
    try {

        const createdBy = req.user._id;
        const allSellers = await sellerModel.find({ createdBy })
        .populate({
            path: 'category',
            select: 'name'

        })

        .populate({
            path: 'createdBy',
            select: 'name email'
        })

        if (!allSellers.length) {
           return success(res, "No sellers found", null);
        }
        return success(res, "All Sellers", allSellers);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
