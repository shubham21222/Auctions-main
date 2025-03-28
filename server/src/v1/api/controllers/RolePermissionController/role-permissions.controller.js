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
export const createRole = async (req, res) => {
    try {

        const { name, permissions } = req.body;
        if (!name) {
            return badRequest(res, "Please add a role name");
        }

        if (name.toLowerCase() == 'admin' || name.toLowerCase() == 'user') {
            return badRequest(res, "Cannot add a role with name 'Admin' or 'User'");
        }

        if(!permissions?.length){
            return badRequest(res, "Please select at least  on permission!");
        }

        const existingRole = await rolePermissionModel.findOne({ name });
        if (existingRole) {
            return badRequest(res, "Role with the same name already exits");
        }

        const role = await rolePermissionModel.create({
            name,
            permissions,
            createdBy: req.user._id
        });

        return sendResponse(res, "Role created successfully", role);

    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get all roles //
export const getAllRoles = async (req, res) => {
    try {
        const roles = await rolePermissionModel.find().sort({ createdAt: -1 });
        return success(res, "Roles", roles);
    } catch (error) {
        return unknownError(res, error.message);
    }
} 

// Get all available permissions //

export const getAllPermissions = async (req, res) => {
    try {
        const permissions = PERMISSIONS;
        return success(res, "permissions", permissions);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get a single role //

export const getSingleRole = async (req, res) => {
    try {

        if (!(await isValidObjectId(res, req.params.id))) return;

        const role = await rolePermissionModel.findById(req.params.id);
        if (!role) {
            return notFound(res, "Role not found");
        }
        return success(res, "Role", role);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Update a role //

export const updateRole = async (req, res) => {
    try {

        const { name, permissions } = req.body;
        if (!name) {
            return badRequest(res, "Please add a role name");
        }

        if (name.toLowerCase() == 'admin' || name.toLowerCase() == 'user') {
            return badRequest(res, "Cannot add a role with name 'Admin' or 'User'");
        }

        if(!permissions?.length){
            return badRequest(res, "Please select at least  on permission!");
        }

        const role = await rolePermissionModel.findById(req.params.id);

        if (!role) {
            return notFound(res, "Role not found");
        }

        const existingRole = await rolePermissionModel.findOne({ name });
        if (existingRole && existingRole._id != req.params.id) {
            return badRequest(res, "Role with the same name already exits");
        }

        const Role = await rolePermissionModel.findOneAndUpdate({_id:req.params.id}, req.body, {
            new: true,
            runValidators: true
        });
        if(name.toLowerCase() != role.name.toLowerCase()){

            await User.updateMany(
                { 'role': role.name },
                {
                    $set: {
                        'role': name,
                    }
                }
            );
        }
        return success(res, "Role updated successfully", Role);

    } catch (error) {

    }
}


// Delete a role //

export const deleteRole = async (req, res) => {
    try {
        const role = await rolePermissionModel.findById(req.params.id);
        if (!role) {
            return notFound(res, "Role not found");
        }

        await rolePermissionModel.findByIdAndDelete(req.params.id);
        return sendResponse(res, "Role deleted successfully");

    } catch (error) {
        return unknownError(res, error.message);
    }
}


