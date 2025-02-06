//Generate Access Token //

import {generateAccessToken} from "../../services/Authorization/tokenAuthorization.js";
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
    onError} from "../../formatters/globalResponse.js"

// Zoho Token service //

export const getZohoToken = async (req, res) => {
    try {
        const token = await generateAccessToken();
        sendResponse(res, 200, true, 'Zoho Token Generated', '', token);
    } catch (error) {
        onError(res, 'Error while generating Zoho Token', error);
    }
};


