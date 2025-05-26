import { Error } from 'mongoose';
import mongoose from 'mongoose';

//send success response --------------------------------------------------------
async function success(res, message, items) {
    sendResponse(res, 200, true, message, "", items);
};

//send created response --------------------------------------------------------
async function created(res, message, items) {
    sendResponse(res, 201, true, message, '', items);
};

//send not found response ------------------------------------------------------
async function notFound(res, message) {
    sendResponse(res, 404, false, message, '', {});
};

//send bad request response ----------------------------------------------------
async function badRequest(res, message, error) {
    sendResponse(res, 400, false, message, error, undefined);
};

//send unauthorized request response -------------------------------------------
async function unauthorized(res, message) {
    sendResponse(res, 401, false, message, '', {});
};

//send forbidden request response ----------------------------------------------
async function forbidden(res, message) {
    sendResponse(res, 403, false, message, '', {});
};

//send validation error response -----------------------------------------------
async function serverValidation(res, error) {
    if (error instanceof Error.ValidationError) {
        // Handle Mongoose validation errors
        const errors = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
        sendResponse(res, 400, false, 'Validation Error', 'ValidationError', errors);
    } else if (typeof error === 'string') {
        // Handle string error messages
        sendResponse(res, 400, false, error, 'ValidationError', { message: error });
    } else if (error && error.errors) {
        // Handle custom validation errors with errors array
        const errors = {};
        error.errors.forEach(err => {
            if (err.param) {
                errors[err.param] = err.msg;
            }
        });
        sendResponse(res, 400, false, 'Validation Error', 'ValidationError', errors);
    } else {
        // Handle any other type of error
        console.error('Server validation error:', error);
        sendResponse(res, 400, false, 'Validation Error', 'ValidationError', { 
            message: error?.message || 'An error occurred during validation' 
        });
    }
}

//send error response ----------------------------------------------------------
async function unknownError(res, error) {
    if (error instanceof Error) {
        if (error.name == "ValidationError") {
            const errormessage = await this.validation(error.message);
            sendResponse(res, 400, false, 'All Fields Required', 'ValidationError', errormessage);
        } else if (error.name == "CastError") {
            sendResponse(res, 400, false, 'Invalid Data', 'CastError', { "data": `Need ${error.kind} but getting ${error.valueType}` });
        } else {
            console.log(error);
            sendResponse(res, 400, false, 'Something Went Wrong', error.message);
        }
    } else if (error.name === "MongoError" && error.code === 11000) {
        const errormessage = await this.alreadyExist(error.keyValue)
        sendResponse(res, 400, false, 'Unique Data Required', 'UniqueDataRequired', errormessage);
    } else {
        sendResponse(res, 500, false, error.message, '', "");
    }
};

//===================================================================================================
async function validation(e) {
    const errors = {};
    const allErrors = e.substring(e.indexOf(':') + 1).trim()
    const AllErrorArrayFormate = allErrors.split(',').map(err => err.trim());
    AllErrorArrayFormate.forEach(error => {
        const [key, value] = error.split(':').map(err => err.trim());
        errors[key.toUpperCase().replace('.', '-')] = value.toUpperCase().replace('.', '-');
    })
    return errors;
};

async function alreadyExist(e) {
    const errors = {};
    const keys = Object.keys(e);
    keys.forEach(error => {
        const [key, value] = [error.toUpperCase().replace('.', '-'), error.toUpperCase().replace('.', '-') + ' Already Exist']
        errors[key] = value.toUpperCase();
    })
    return errors;
};
//====================================================================================================

async function onError(res, message, error) {
    sendResponse(res, 400, false, message, error, null);
};

async function sendResponse(res, statusCode, status, message, error, items) {
    let response = {
        status: status,
        subCode: statusCode,
        message: message,
        error: error,
        items: items
    }
    if (res.tokenInfo) {
        response.tokenInfo = res.tokenInfo
    }
    res.status(statusCode); // Use statusCode instead of hard-coded 200
    res.json(response);
}

async function invalid(res, message, items) {
    sendResponse(res, 301, false, message, '', items);
};

// Validate MongoDB ObjectId
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

// -------------------------------------------------------------------------------------------------- 
export {
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
}