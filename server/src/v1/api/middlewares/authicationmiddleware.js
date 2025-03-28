import jwt from "jsonwebtoken";
import User from "../models/Auth/User.js";
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
    onError
} from "../formatters/globalResponse.js"

import ErrorResponse from "../Utils/errorRes.js"


// Make a middleware function to check if the user is logged in


export const IsAuthenticated = async (req, res, next) => {
    try {
        const authenticationHeader = req.headers.authorization;

        if (!authenticationHeader) {
            return forbidden(res, "Not authorized to access this route");
        }

        const token = authenticationHeader.trim(); // Trim any extra spaces
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return sendResponse(res, notFound, "No user found with this ID");
        }

        // Check if the active token matches
        if (!user.activeToken || user.activeToken !== token) {
            return badRequest(res, "Token is not valid");
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ status: false, subCode: 500, message: "Something went wrong!" });
    }
};


// Make a middleware function to authorize the roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {

            return unauthorized(res, `Role (${req.user.role}) is not allowed to access this resource`);

        }

        next();
    };
};

export const authorizePermission = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {

            return unauthorized(res, `Role (${req.user.role}) is not allowed to access this resource`);

        }

        next();
    };
};