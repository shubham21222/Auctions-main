import jwt from "jsonwebtoken";
import User from "../models/Auth/User";
import { success,
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
    onError} from "../../../../src/v1/api/formatters/globalResponse.js"

exports.generateToken = (payload, expiresIn = '12h') => {
    return jwt.sign(payload, process.env.jwtKey, { expiresIn });
};
exports.generateTokenForPwd = (payload, expiresIn = '5m') => {
    return jwt.sign(payload, process.env.jwtKey, { expiresIn });
};


exports.verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.jwtKey);
        return decoded;
    } catch (error) {
        // Handle invalid/expired tokens here
        console.log(error);
        return null;
    }
}

exports.isAuthJWT = async(req , res , next)=>{
    const authHeader = req.headers.authorization;
    let token = ""
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      } else {
        token = authHeader;
      }

      if (!token) {
        return success(res, "Token not found", null);
      }

      try {
        const decodedData = jwt.verify(token, process.env.jwtKey);
           //  console.log(decodedData);
       req.user = await User.findOne({ email: decodedData?.email });
       if (!req.user) {
        req.user = await Admin.findOne({ email: decodedData?.email });
      }

      if (req.user.activeToken  && req.user.activeToken === token) {
        next();
      } else {
        return badRequest(res, "Invalid Token", null);
      }
        
      } catch (error) {

        if(error.name === 'TokenExpiredError') {
            return badRequest(res, "Token Expired", null);
      }

      else if(error.name === 'JsonWebTokenError') {
        return badRequest(res, "Invalid Token", null);
      }

      else {
        return unknownError(res, error);
      }
    }


}


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return forbidden(res, "You are not authorized to access this route", null);
        }
        next();
    }
}
