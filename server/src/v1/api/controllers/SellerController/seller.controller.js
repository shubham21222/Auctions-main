import sellerModel from '../../models/Seller/seller.model.js';
import userModel from '../../models/Auth/User.js';
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


export const createSeller = async (req, res) => {
    try {
        const { ...data } = req.body;
        data.createdBy = req.user._id;
        const createSeller = await sellerModel.create(data);
        if (createSeller) {
            return sendResponse(res, created, "Seller created successfully", createSeller);
        } else {
            return sendResponse(res, badRequest, "Unable to create seller");
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}


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
            return sendResponse(res, notFound, "No sellers found");
        }

        return sendResponse(res, success, "All Sellers", {
            sellers: allSellers,
            totalSellers,
            currentPage: page,
            totalPages: Math.ceil(totalSellers / limit),
        });
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
            return sendResponse(res, success, "Seller", seller);
        } else {
            return sendResponse(res, notFound, "Seller not found");
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
            return sendResponse(res, notFound, "Seller not found");
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
            return sendResponse(res, success, "Seller updated successfully", updatedSeller);
        } else {
            return sendResponse(res, notFound, "Seller not found");
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
            return sendResponse(res, success, "Seller deleted successfully");
        } else {
            return sendResponse(res, notFound, "Seller not found");
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}