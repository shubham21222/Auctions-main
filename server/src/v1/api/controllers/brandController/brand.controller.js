import Brands from "../../models/Brands/brands.model.js";
import {
    success,
    created,
    notFound,
    badRequest,
    unknownError
} from "../../../../../src/v1/api/formatters/globalResponse.js";

// Create a new brand
export const createBrand = async (req, res) => {
    try {
        // Check if brand already exists
        const existingBrand = await Brands.findOne({ brandName: req.body.brandName });
        if (existingBrand) {
            return badRequest(res, 'Brand already exists');
        }

        const UserId = req.user._id;
        if(UserId) {
            req.body.createdBy = UserId;
        }

        // Create new brand
        const newBrand = new Brands(req.body);
        await newBrand.save();

        return created(res, 'Brand created successfully', newBrand);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all brands
export const getAllBrands = async (req, res) => {
    try {
        const brands = await Brands.find({}).sort({ createdAt: -1 })
        .populate('createdBy', 'name');
        return success(res, 'Brands fetched successfully', brands);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brands.findById(req.params.id).populate('createdBy', 'name');
        if (!brand) {
            return notFound(res, 'Brand not found');
        }
        return success(res, 'Brand fetched successfully', brand);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update brand by ID
export const updateBrandById = async (req, res) => {
    try {
        const updatedBrand = await Brands.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBrand) {
            return notFound(res, 'Brand not found');
        }
        return success(res, 'Brand updated successfully', updatedBrand);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete brand by ID
export const deleteBrandById = async (req, res) => {
    try {
        const deletedBrand = await Brands.findByIdAndDelete(req.params.id);
        if (!deletedBrand) {
            return notFound(res, 'Brand not found');
        }
        return success(res, 'Brand deleted successfully');
    } catch (error) {
        return unknownError(res, error.message);
    }
};
