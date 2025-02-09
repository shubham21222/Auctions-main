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

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return badRequest(res, "Please upload an image");
        }

        // Get image URL based on server domain
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

       return success(res, "Image uploaded successfully", { imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
