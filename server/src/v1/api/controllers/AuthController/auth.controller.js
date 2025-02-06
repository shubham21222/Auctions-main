import User from  "../../models/Auth/User.js"
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
} from "../../../../../src/v1/api/formatters/globalResponse.js"
import {validateMongoDbId} from "../../Utils/validateMongodbId.js"
import { generateToken, verifyToken } from "../../config/jwt.js"
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {sendToken}  from  "../../Utils/genToken.js"
import crypto from 'crypto'



const generateResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
  };

// Register User //
export const register = async (req, res , next) => {
    const { email, password } = req.body;
    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return badRequest(res, 'User already exists');
        }

        if(!email || !password){
            return badRequest(res, 'Please provide an email and password');
        }

        // Generate reset password token and set expiry
        const resetToken = generateResetPasswordToken();
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const userData = {
            email,
            name: req.body.name,
            role: req.body.role,
            passwordResetToken: resetToken,
            passwordResetExpires: passwordResetExpires,
        }

        if(password){
            userData.password = password;
        }

        // create a new User //

            // Create the new user
          const newUser = await User.create(userData);
        sendToken(newUser, 201, res);


    } catch (error) {
        next(error);
    }
}


// Login Token //

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return badRequest(res, "Please provide an email and password");
        }

        // Find user by email and select password field explicitly
        const findUser = await User.findOne({ email }).select("+password");

        // If user not found, return an error
        if (!findUser) {
            return badRequest(res, "Invalid credentials");
        }

        // If user exists but has no password (e.g., social login users)
        if (!findUser.password) {
            const token = findUser.getSignedToken();

            await User.findByIdAndUpdate(
                findUser._id.toString(),
                { activeToken: token },
                { new: true }
            );

            return success(res, "Login Successful", {
                success: true,
                user: {
                    _id: findUser._id,
                    name: findUser.name,
                    email: findUser.email,
                    role: findUser.role,
                },
                token: token,
            });
        }

        // Validate password
        const isMatch = await findUser.matchPassword(password);
        if (!isMatch) {
            return badRequest(res, "Invalid credentials");
        }

        // Generate token and update activeToken in DB
        const token = findUser.getSignedToken();

        await User.findByIdAndUpdate(
            findUser._id.toString(),
            { activeToken: token },
            { new: true }
        );

        return success(res, "Login Successful", {
            success: true,
            user: {
                _id: findUser._id,
                name: findUser.name,
                email: findUser.email,
                role: findUser.role,
            },
            token: token,
        });

    } catch (error) {
        unknownError(res, error);
    }
};


// Logout User //

export const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if(!authHeader){
            return badRequest(res, "No token provided");
        }

        let token ;

       if(authHeader){
        token = authHeader;
       }

       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const userData = await User.findOne({ _id: decoded?.id });
       if(userData.activeToken && userData.activeToken === token){
          const user = await User.findByIdAndUpdate(userData._id, { activeToken: null }, { new: true });
          if(!user){
              return badRequest(res, "Invalid token , Please login again");
          }

          return success(res, "User logged out successfully");
       }
       else{
              return badRequest(res, "Invalid token , Please login again");
       }

    } catch (error) {
        if(error.name === "JsonWebTokenError"){
            return badRequest(res, "Invalid token , Please login again");
        }
        else if (error.name === "TokenExpiredError"){
            return badRequest(res, "Token expired , Please login again");
        }

        else{
            unknownError(res, error);
        }
    }
}


// verify User //

export const verifyUser = async (req, res, next) => {
    const {token} = req.params;
    if(!token){
        return badRequest(res, "Invalid token");
    }
    try{

        const decoded = verifyToken(token);
        if(!decoded){
            return badRequest(res, "Invalid token");
        }

        const {id} = decoded;
        const loggedInUser = await User.findOne({
            _id: id,
            activeToken: token
        }).select("-password -activeToken");

        if(!loggedInUser){
            return badRequest(res, "Invalid token");
        }

        return success(res, "User verified successfully", loggedInUser);

    }
    catch(error){
        unknownError(res, error);
    }
}






