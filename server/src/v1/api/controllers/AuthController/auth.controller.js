import User from  "../../models/Auth/User.js"
import RolePermission from  "../../models/RolePermission/role-permissions.model.js"
import   {PERMISSIONS}  from '../../constants/common.constants.js';
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
import { stripeService } from '../../services/Stripe/stripe.service.js';


const generateResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
};

const sendVerificationEmail = async (user) => {
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const verificationLink = `https://bid.nyelizabeth.com/verify-email?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f7;
                margin: 0;
                padding: 0;
            }
            .email-container {
                background-color: #ffffff;
                width: 90%;
                max-width: 600px;
                margin: 30px auto;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                border: 1px solid #e0e0e0;
            }
            .email-header {
                background-color: #1a73e8;
                padding: 20px;
                text-align: center;
                color: white;
            }
            .email-body {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                padding: 12px 25px;
                margin-top: 20px;
                background-color: #1a73e8;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
            }
            .email-footer {
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #888888;
            }
            .highlight {
                color: #1a73e8;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Email Verification</h1>
            </div>
            <div class="email-body">
                <p>Hi <strong>${user.name || 'User'}</strong>,</p>

                <p>Thank you for signing up with <span class="highlight">NY Elizabeth</span>!</p>

                <p>Please verify your email address to activate your account. Click the button below to confirm your email:</p>

                <a href="${verificationLink}" class="button">Verify Email</a>

                <p>If you didn't sign up for an account, you can ignore this email.</p>

                <p>Thanks,<br><strong>The NY Elizabeth Team</strong></p>
            </div>
            <div class="email-footer">
                &copy; ${new Date().getFullYear()} NY Elizabeth. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
        to: user.email,
        subject: "✅ Verify Your Email for NY Elizabeth",
        html
    });
};
// Register User //
export const register = async (req, res , next) => {
    const { email, password , BillingDetails, paymentMethodId , temp_password} = req.body;
    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return badRequest(res, 'User already exists');
        }

        if(!email){
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
            BillingDetails:BillingDetails,
            // cardDetails:cardDetails,
        }

        if(password){
            userData.password = password;
        }

        if(temp_password == "true"){
            const tempPassword = crypto.randomBytes(5).toString('hex');
            userData.password = tempPassword;

            await sendEmail({
                to: email,
                subject: "Your Temporary Password - NY Elizabeth",
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f7;
                            margin: 0;
                            padding: 0;
                        }
                        .email-container {
                            background-color: #ffffff;
                            width: 90%;
                            max-width: 600px;
                            margin: 30px auto;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e0e0e0;
                        }
                        .email-header {
                            background-color: #1a73e8;
                            padding: 20px;
                            text-align: center;
                            color: white;
                        }
                        .email-body {
                            padding: 30px;
                            color: #333333;
                            line-height: 1.6;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 25px;
                            margin-top: 20px;
                            background-color:rgb(47, 232, 26);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                        }
                        .email-footer {
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #888888;
                        }
                        .highlight {
                            color: #1a73e8;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>NY Elizabeth</h1>
                        </div>
                        <div class="email-body">
                            <p>Dear <strong>${req.body.name || 'User'}</strong>,</p>
                            
                            <p>We have generated a temporary password for your account at <span class="highlight">NY Elizabeth</span>. Please use the password below to log in:</p>
                            
                            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                                <h2 style="margin: 0; color: #1a73e8;">${tempPassword}</h2>
                            </div>
                            
                            <p>For security reasons, we recommend changing your password immediately after logging in.</p>
                            
                            <a href="https://bid.nyelizabeth.com/" class="button">Login Now</a>
                            
                            <p>If you did not request this, please ignore this email or contact our support team immediately.</p>
                            
                            <p>Thank you,<br><strong>NY Elizabeth Support Team</strong></p>
                        </div>
                        <div class="email-footer">
                            &copy; ${new Date().getFullYear()} NY Elizabeth. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                `
            });
            
            
        }

        else if (temp_password == "false"){
            await sendEmail({
                to: email,
                subject: "🎉 Welcome to NY Elizabeth - We're Excited to Have You!",
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f7;
                            margin: 0;
                            padding: 0;
                        }
                        .email-container {
                            background-color: #ffffff;
                            width: 90%;
                            max-width: 600px;
                            margin: 30px auto;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e0e0e0;
                        }
                        .email-header {
                            background-color: #1a73e8;
                            padding: 20px;
                            text-align: center;
                            color: white;
                        }
                        .email-body {
                            padding: 30px;
                            color: #333333;
                            line-height: 1.6;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 25px;
                            margin-top: 20px;
                            background-color:rgb(26, 232, 29);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                        }
                        .email-footer {
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #888888;
                        }
                        .highlight {
                            color: #1a73e8;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>Welcome to NY Elizabeth!</h1>
                        </div>
                        <div class="email-body">
                            <p>Dear <strong>${req.body.name || 'User'}</strong>,</p>
                            
                            <p>🎉 Congratulations on successfully registering at <span class="highlight">NY Elizabeth</span>! We're thrilled to have you as part of our community.</p>
                            
                            <p>Whether you're here to explore, create, or engage, we're committed to providing you with an exceptional experience. Here's a quick link to get started:</p>
                            
                            <a href="https://bid.nyelizabeth.com/" class="button">Explore NY Elizabeth</a>
                            
                            <p>Need help or have questions? Feel free to reach out to our support team anytime. We're here to assist you.</p>
                            
                            <p>Welcome aboard, and we can't wait to see what amazing things you achieve with us!</p>
                            
                            <p>Warm Regards,<br><strong>The NY Elizabeth Team</strong></p>
                        </div>
                        <div class="email-footer">
                            &copy; ${new Date().getFullYear()} NY Elizabeth. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                `
            });
            
        }
        if(paymentMethodId){
            const customer = await stripeService.findOrCreateCustomer(email,req.body.name);
            await stripeService.attachCardToCustomer(paymentMethodId, customer.id);
            userData.stripeCustomerId = customer.id;
            userData.paymentMethodId = paymentMethodId;
        }
        // create a new User //

        // Create the new user
        const newUser = await User.create(userData);
        sendVerificationEmail(newUser);
        
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
            let permissions = [];
            if(findUser.role.toLowerCase() == 'admin'){
                permissions = Object.values(PERMISSIONS).flat();;
            }else{
                permissions = await  RolePermission.findOne({name:findUser.role}).select('permissions');
                permissions = permissions?.permissions ? permissions?.permissions  : [];
            }
            return success(res, "Login Successful", {
                success: true,
                user: {
                    _id: findUser._id,
                    name: findUser.name,
                    email: findUser.email,
                    role: findUser.role,
                    passwordResetToken: findUser.passwordResetToken,
                    permissions,
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
        let permissions = [];
        if(findUser.role.toLowerCase() == 'admin'){
            permissions = Object.values(PERMISSIONS).flat();;
        }else{
            permissions = await  RolePermission.findOne({name:findUser.role}).select('permissions');
            permissions = permissions?.permissions ? permissions?.permissions  : [];
        }
        return success(res, "Login Successful", {
            success: true,
            user: {
                _id: findUser._id,
                name: findUser.name,
                email: findUser.email,
                role: findUser.role,
                passwordResetToken: findUser.passwordResetToken,
                permissions
            },
            token: token,
        });

    } catch (error) {
        unknownError(res, error);
    }
};

export const sendVerificationMail = async (req, res, next) => {
    const { email } = req.body;

    try {
        if (!email) {
            return badRequest(res, "Please provide an email ");
        }

        // Find user by email and select password field explicitly
        const findUser = await User.findOne({ email });

        if (!findUser) {
            return badRequest(res, "Invalid email ");
        }
        if(findUser.isEmailVerified){
            return badRequest(res, "Email  already verified!");
        }
        sendVerificationEmail(findUser);

        return success(res, "Verification mail sent", {
            success: true
        });

    } catch (error) {
        unknownError(res, error);
    }
};

export const verifyMail = async (req, res, next) => {
    const { token } = req.body;

    try {
        if (!token) {
            return badRequest(res, "Please provide a token");
        }
        let userId = null;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        } catch (err) {
            console.error('Invalid token:', err.message);
            return badRequest(res, 'Invalid or expired token');
        }

        const findUser = await User.findOne({ _id: userId });
        if (!findUser) {
            return badRequest(res, "User not found");
        }

        if (findUser.isEmailVerified) {
            return badRequest(res, "Email already verified!");
        }

        // Update user's email verification status
        findUser.isEmailVerified = true;
        await findUser.save();

        // Emit socket event for email verification
        const io = req.app.get('io') || req.app.io;
        if (io) {
            io.emit('emailVerified', {
                userId: findUser._id,
                isEmailVerified: true
            });
            console.log('Email verification socket event emitted for user:', findUser._id);
        }

        // Return success with updated user data
        return success(res, "Email verified successfully!", {
            status: true,
            items: {
                ...findUser.toObject(),
                isEmailVerified: true
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        return unknownError(res, error.message || "Failed to verify email");
    }
};
// Logout User //

export const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if(!authHeader){
            return badRequest(res, "Invalid token, Please login again");
        }

        const token = authHeader;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.id) {
                // Try to find and update user even if token is invalid
                await User.findOneAndUpdate(
                    { _id: decoded.id },
                    { activeToken: null }
                );
            }
        } catch (error) {
            // Continue with logout even if token verification fails
        }

        return success(res, "User logged out successfully");

    } catch (error) {
        return badRequest(res, "Invalid token, Please login again");
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
        let loggedInUser = await User.findOne({
            _id: id,
            activeToken: token
        }).select("-password -activeToken");

        if(!loggedInUser){
            return badRequest(res, "Invalid token");
        }
        let permissions = [];
        if(loggedInUser.role.toLowerCase() == 'admin'){
            permissions = Object.values(PERMISSIONS).flat();;
        }else{
            permissions = await  RolePermission.findOne({name:loggedInUser.role}).select('permissions');
            permissions = permissions?.permissions ? permissions?.permissions  : [];
        }
        loggedInUser = loggedInUser.toObject(); // If it's a Mongoose document
        loggedInUser.permissions = permissions; // Now assign permissions
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
            <h3> The NY Elizabeth Team </h3>
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
                { mobile: { $regex: search, $options: 'i' } },
                {role: { $regex: search, $options: 'i' } }

            ];
        }

        const users = await User.aggregate([
            { $match: matchQuery },

            // Lookup auctions created by the user
            {
                $lookup: {
                    from: 'auctions',
                    localField: '_id',
                    foreignField: 'winner',
                    as: 'userAuctions'
                }
            },


            // Lookup products associated with those auctions
            {
                $lookup: {
                    from: 'auctionproducts',
                    localField: 'userAuctions.auctionProduct',
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
                                auctionProduct: {
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
                                status: { $ifNull: ["$$auction.status", ""] },
                                payment_status:{ $ifNull: ["$$auction.payment_status", ""] },
                                shipping_status:{$ifNull:["$$auction.shipping_status", ""]}
                                // bids: { $ifNull: ["$$auction.bids", []] },

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

export const addCard = async (req, res, next) => {
    try {
      const { _id } = req.user; // Correct destructuring from req.user (not req.user._id)
      validateMongoDbId(_id);
  
      // Find the user
      let user = await User.findById(_id);
      if (!user) {
        return notFound(res, "User not found");
      }
  
      // Check if a card is already attached
      if (user.paymentMethodId) {
        return badRequest(res, "Card already attached!");
      }
  
      const { paymentMethodId } = req.body;
      if (!paymentMethodId) {
        return badRequest(res, "Please provide paymentMethodId");
      }
  
      // Find or create Stripe Customer
      const customer = await stripeService.findOrCreateCustomer(user.email, user.name);
  
      // Attach the card to the customer and get payment method details
      const paymentMethod = await stripeService.attachCardToCustomer(paymentMethodId, customer.id);
  
      // Prepare card details to save (align with your schema)
      const cardDetails = {
        cardNumber: null, // Not provided by Stripe for security reasons; use last4 instead
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        cardholderName: paymentMethod.billing_details.name || user.name,
        BillingDetails: [{
          country: paymentMethod.card.country || null,
          AddressLine1: paymentMethod.billing_details.address?.line1 || null,
          AddBalanceLine2: paymentMethod.billing_details.address?.line2 || null,
          city: paymentMethod.billing_details.address?.city || null,
          Pincode: paymentMethod.billing_details.address?.postal_code || null,
          state: paymentMethod.billing_details.address?.state || null,
        }],
      };
  
      // Update user with payment details
      user.paymentMethodId = paymentMethodId;
      user.stripeCustomerId = customer.id;
      user.cardDetails = user.cardDetails || [];
      if (!user.cardDetails.some(card => card.paymentMethodId === paymentMethodId)) {
        user.cardDetails.push(cardDetails);
      }
  
      // Save the updated user
      await user.save();
  
      // Return success response with updated user
      return success(res, "Card added successfully!", user.toObject());
    } catch (error) {
      console.error("Error in addCard:", error.message);
      return unknownError(res, error);
    }
  };











