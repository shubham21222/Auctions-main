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
import {sendEmail} from "../../Utils/sendEmail.js"
import crypto from 'crypto'



const generateResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
  };

// Register User //
export const register = async (req, res , next) => {
    const { email, password , BillingDetails} = req.body;
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
            BillingDetails:BillingDetails
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
            return badRequest(res, "Invalid email ");
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
                    passwordResetToken: findUser.passwordResetToken,
                },
                token: token,
            });
        }

        // Validate password
        const isMatch = await findUser.matchPassword(password);
        if (!isMatch) {
            return badRequest(res, "Invalid password");
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
                passwordResetToken: findUser.passwordResetToken,
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


// Forgot Password //



// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return badRequest(res, "Please provide an email.");
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return badRequest(res, "User not found.");
        }

        // Generate reset password token
        const resetToken = user.getResetPasswordToken();
        console.log(resetToken);
        await user.save({ validateBeforeSave: false });

        // Construct reset URL
        // const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
        const resetUrl = `https://bid.nyelizabeth.com/reset-password/${resetToken}`;

        // Email Template
        const message = `
    <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            border-radius: 0 0 5px 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Hello ${user.name},</h2>
        </div>
        <div class="content">
            <p>We have received a request to reset your password for your account on <strong>NY Elizabeth</strong>. If you did not request this change, you can ignore this email and your password will not be changed.</p>
            
            <p>To reset your password, please click on the following link and follow the instructions:</p>
            
            <p><a class="button" href="${resetUrl}">Reset Password</a></p>
            
            <p>This link will expire in <strong>15 minutes</strong> for security reasons. If you need to reset your password after this time, please make another request.</p>
        </div>
        <div class="footer">
            <h3>Thank you,</h3>
            <h3> Dear Team </h3>
        </div>
    </div>
</body>
</html>
    `;

        // Send email
        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                html: message, // Sending as HTML
            });

            return success(res, "Password reset email sent successfully.");
        } catch (error) {
            // Reset token values if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return unknownError(res, "Email could not be sent. Please try again later.");
        }
    } catch (error) {
        return unknownError(res, error.message || "Something went wrong.");
    }
};


// Reset Password //

export const resetPassword = async (req, res , next) => {

    try {

        const { resetToken } = req.params;
        const { password } = req.body;


        if (!resetToken || !password) {
            return badRequest(res, "Invalid token or password");
        }

        const user = await User.findOne({
            passwordResetToken: resetToken,
            passwordResetExpires: { $gt: Date.now() },
        })

        if (!user) {
            return badRequest(res, "Invalid token or token expired");
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return success(res, "Password reset successfully");

        
    } catch (error) {

        unknownError(res, error);
        
    }

}


//Update User Profile //

export const updateProfile = async (req, res, next) => {
    try {
        const { _id } = req.user._id; // Correct destructuring
            validateMongoDbId(_id); // Ensuring a valid MongoDB ID
      

        const { name, email } = req.body;

        if (!name?.trim() && !email?.trim()) {
            return badRequest(res, "Please provide a valid name or email to update");
        }

        // Construct the update object dynamically
        const updatedFields = {};
        if (name?.trim()) updatedFields.name = name.trim();
        if (email?.trim()) updatedFields.email = email.trim();

        const user = await User.findByIdAndUpdate(_id, updatedFields, {
            new: true,
            runValidators: true,
        });

        return sendResponse(res, 200, true, "Profile updated successfully", "", user);
    } catch (error) {
        return unknownError(res, error);
    }
};



// Update Password //

export const updatePassword = async (req, res, next) => {
    try {
        // Extract user ID from request
        const { _id } = req.user._id;
        validateMongoDbId(_id); // Ensure it's a valid MongoDB ID

        // Extract password fields from request body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return badRequest(res, "Please provide old password, new password, and confirm password");
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return badRequest(res, "New password and confirm password do not match");
        }

        // Find user by ID and include password field
        const user = await User.findById(_id).select("+password");
        if (!user) {
            return badRequest(res, "User not found");
        }

        // Validate old password
        const isPasswordMatch = await user.matchPassword(oldPassword);
        if (!isPasswordMatch) {
            return badRequest(res, "Invalid old password");
        }

        // Update password and set password change timestamp
        user.password = newPassword;
        user.passwordChangedAt = Date.now();

        // Save updated user details
        await user.save();

        return success(res, "Password updated successfully");

    } catch (error) {
        unknownError(res, error);
    }
};


// Update Billing Address //

export const updateBillingAddress = async (req, res, next) => {
    try {
        const { _id } = req.user._id;



        console.log("Id" , _id)
        validateMongoDbId(_id);

        const { BillingDetails } = req.body;

        if (!BillingDetails) {
            return badRequest(res, "Please provide a valid billing address to update");
        }

        const user = await User.findByIdAndUpdate(
            _id,
            { BillingDetails },
            { new: true, runValidators: true }
        );

        return success(res, "Billing address updated successfully", user);
    } catch (error) {
        unknownError(res, error);
    }
}

// get All Users //

// Controller function to get all users with sorting, pagination, and search
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search } = req.query;
        const skip = (page - 1) * limit;
        const sortOrder = order == 'asc' ? 1 : -1;

        let matchQuery = {};
        

        if (search) {
            matchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.aggregate([
            { $match: matchQuery },

            // Lookup auctions created by the user
            {
                $lookup: {
                    from: 'auctions',
                    localField: '_id',
                    foreignField: 'createdBy',
                    as: 'userAuctions'
                }
            },

            // Lookup products associated with those auctions
            {
                $lookup: {
                    from: 'products',
                    localField: 'userAuctions.product',
                    foreignField: '_id',
                    as: 'auctionProducts'
                }
            },

            // Lookup orders made by the user
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'userOrders'
                }
            },

            {
                $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    mobile: 1,
                    walletBalance: 1,
                    Payment_Status: 1,
                    createdAt: 1,

                    userAuctions: {
                        $map: {
                            input: { $ifNull: ["$userAuctions", []] },
                            as: "auction",
                            in: {
                                product: {
                                    title: {
                                        $ifNull: [
                                            { $arrayElemAt: ["$auctionProducts.title", 0] },
                                            ""
                                        ]
                                    },
                                    price: {
                                        $ifNull: [
                                            { $arrayElemAt: ["$auctionProducts.price", 0] },
                                            0
                                        ]
                                    }
                                },
                                auctionType: { $ifNull: ["$$auction.auctionType", ""] },
                                lotNumber: { $ifNull: ["$$auction.lotNumber", ""] },
                                createdBy: { $ifNull: ["$$auction.createdBy", ""] },
                                status: { $ifNull: ["$$auction.status", ""] }
                            }
                        }
                    },

                    userOrders: {
                        $map: {
                            input: { $ifNull: ["$userOrders", []] },
                            as: "order",
                            in: {
                                paymentStatus: { $ifNull: ["$$order.paymentStatus", ""] },
                                OrderId: { $ifNull: ["$$order.OrderId", ""] },
                                totalAmount: { $ifNull: ["$$order.totalAmount", 0] },
                                products: { $ifNull: ["$$order.products", []] }
                            }
                        }
                    }
                }
            },

            { $sort: { [sortBy]: sortOrder } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const totalUsers = await User.countDocuments(matchQuery);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                totalUsers,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// get user by id //

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);


        const user = await
            User.findById(id).select("-password -activeToken");


        if (!user) {
            return notFound(res, 'User not found');
        }

        return success(res, "User found", user);

    }
    catch (error) {
        onError(res, error);
    }
}


// get user by Billing Address //

export const getUserByBillingAddress = async (req, res, next) => {
    try {
        
        const {id} = req.params;
        validateMongoDbId(id);

        const user = await User.findById(id).select("BillingDetails");
        if(!user){
        return notFound(res, "User not found");
        }

        return success(res, "User found", user);
        
    } catch (error) {
        return unknownError(res, error);  
    }
}











