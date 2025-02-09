import categoryModel from "../../models/Category/category.model.js";
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
    invalid,
    onError,
    isValidObjectId
} from "../../../../../src/v1/api/formatters/globalResponse.js";
import { response } from "express";
import { validateMongoDbId } from "../../Utils/validateMongodbId.js";

// Create a new category //
export const createCategory = async (req, res) => {
try {
    
  const {name , description , active , createdAt , createdBy} = req.body;
  if(!name){
    return badRequest(res, "Please add a category name");
  }

  const findCategory = await categoryModel.findOne({name});
    if(findCategory){
        return  badRequest(res, "Category already exist");
    }

    const category = await categoryModel.create({
        name,
        description,
        active,
        createdAt,
        createdBy:req.user._id
    });

    return sendResponse(res, "Category created successfully", category);

} catch (error) {
    return unknownError(res, error.message);
}
}


// Get all categories //
export const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find().sort({createdAt: -1});
        return success(res, "Categories", categories);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get a single category //

export const getSingleCategory = async (req, res) => {
    try {

    if (!(await isValidObjectId(res, req.params.id))) return;

        const category = await categoryModel.findById(req.params.id);
        if(!category){
            return notFound(res, "Category not found");
        }
        return success(res, "Category", category);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Update a category //

export const updateCategory = async (req, res) => {
    try {

        const {name , description , active , createdAt , createdBy} = req.body;
        if(!name){
            return badRequest(res, "Please add a category name");
        }
        const category = await categoryModel.findById(req.params.id);
        if(!category){
            return notFound(res, "Category not found");
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return success(res, "Category updated successfully", updatedCategory);
        
    } catch (error) {
        
    }
}


// Delete a category //

export const deleteCategory = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        if(!category){
            return notFound(res, "Category not found");
        }

        await categoryModel.findByIdAndDelete(req.params.id);
        return sendResponse(res, "Category deleted successfully");

    } catch (error) {
        return unknownError(res, error.message);
    }
}


