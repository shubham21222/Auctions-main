import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
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



    const Credinal = {
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code: process.env.AUTHORIZATION_CODE
    }

    // console.log("Credinal", Credinal)




export const generateAccessToken=async(authCode)=>{

        try {
        const url = `https://accounts.zoho.eu/oauth/v2/token?grant_type=authorization_code&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&code=${process.env.AUTHORIZATION_CODE}`;

        const response = await axios.post(url, {}, {});
        console.log("response data" , response)

        return response.data;
    } catch (error) {
        console.log(error)
        unknownError(res, error);
    }

}



