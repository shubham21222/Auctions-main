import rolePermissionModel from "../../models/RolePermission/role-permissions.model.js";
import User from "../../models/Auth/User.js";
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
import   {PERMISSIONS}  from '../../constants/common.constants.js';

import { response } from "express";
import { validateMongoDbId } from "../../Utils/validateMongodbId.js";

// Create a new role //
export const createUser = async (req, res) => {
    try {

        const { name, role, email, password } = req.body;

        if (!name || !role || !email || !password) {
            return badRequest(res, "Please fill all the required fields");
        }
        //checking existing user
       let existingUser =  await User.findOne({email});
       if(existingUser){
        return badRequest(res, "User with the same email exists! Please try different email");
       }
        const user = await User.create({
            name,
            email,
            role,
            password
        });

        return sendResponse(res, "User created successfully", user);

    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Update a user //

export const updateUser = async (req, res) => {
    try {

        const { name, role, email,password } = req.body;
        if (!name || !role || !email) {
            return badRequest(res, "Please fill all the required fields");
        }
        let user = await User.findOne({
            _id:req.params.id
        });

        if(!user){
            return notFound(res, "User not found");
        }
        let existingUser =  await User.findOne({email});
        if(existingUser && existingUser._id != req.params.id){
            return badRequest(res, "User with the same email exists! Please try different email");
        }

        if(password){
            user.password = password;
        }
        user.name = name;
        user.role = role;
        user.email = email;
        await user.save();
        return success(res, "User updated successfully", user);

    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Delete a user //

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return notFound(res, "User not found");
        }

        await User.findByIdAndDelete(req.params.id);
        return sendResponse(res, "User deleted successfully");

    } catch (error) {
        return unknownError(res, error.message);
    }
}


