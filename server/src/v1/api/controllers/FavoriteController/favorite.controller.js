import Favorite from "../../models/Favorite/favorite.js";
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
import productModel from "../../models/Products/product.model.js";
import { validateMongoDbId } from "../../Utils/validateMongodbId.js";


// create the faviorre //


export const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
           return  badRequest(res, "Please provide a product ID");
        }

        validateMongoDbId(productId);
        const user = req.user._id;

        // Check if the product is already favorited by the user
        const favorite = await Favorite.findOne({ user, product: productId });

        if (favorite) {
            // Remove from favorites
            await Favorite.findByIdAndDelete(favorite._id);
            await productModel.findByIdAndUpdate(productId, { favorite: false }); // Optional update
            return success(res, "Product removed from favorites", favorite);
        } else {
            // Add to favorites
            const newFavorite = await Favorite.create({ user, product: productId });
            await productModel.findByIdAndUpdate(productId, { favorite: true }); // Optional update
            return success(res, "Product added to favorites", newFavorite);
        }
    } catch (error) {
    return unknownError(res, error.message);
    }
};




// get all favorites //


export const getAllFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
        .populate({
          path: "product",
            select: "title price image category",
        })

        .populate({
            path: "user",
            select: "name email",
        })
        .sort({ createdAt: -1 });
        return success(res, "Favorites", favorites);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// delete the favorite //

export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.body;
        validateMongoDbId(id);
        const favorite = await Favorite.findByIdAndDelete(id);
        if (!favorite) {
            return notFound(res, "Favorite not found");
        }
        await productModel.findByIdAndUpdate(favorite.product, { favorite: false });
        return success(res, "Favorite deleted successfully", favorite);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


