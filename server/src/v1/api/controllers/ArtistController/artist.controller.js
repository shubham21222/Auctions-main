import Artist from "../../models/Artist/artist.mode.js";
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


// create a new artist //


export const createArtist = async (req, res) => {
    try{
        // validate request data

        // check if artist already exist
        const artist = await Artist.findOne({ artistName: req.body.artistName });
        if(artist){
            return badRequest(res, 'Artist already exist');
        }

        const userId = req.user?._id;
        if (userId) {
            req.body.createdBy = userId;
        }

        // create new artist
        const newArtist = new Artist(req.body);
        await newArtist.save();

        return success(res, 'Artist created Successfully' ,newArtist);
    }
    catch(error){
        return unknownError(res, error.message)
    }
}


// get all artists //

export const getAllArtists = async (req, res) => {
    try{
        const artists = await Artist.find({}).sort({createdAt: -1})
        .populate('createdBy', 'name');
        return success(res, 'Artists fetched successfully', artists);
    }
    catch(error){
        return unknownError(res, error.message)
    }
}


// get artist by id //

export const getArtistById = async (req, res) => {
    try{
        const artist = await Artist.findById(req.params.id).populate('createdBy', 'name');;

        if(!artist){
            return notFound(res, 'Artist not found');
        }

        return success(res, 'Artist fetched successfully', artist);
    }
    catch(error){
        return unknownError(res, error.message)
    }
}


// update artist by id //

export const updateArtistById = async (req, res) => {
    try{
        // validate request data

        // check if artist already exist
        const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {new: true});

        if(!artist){
            return notFound(res, 'Artist not found');
        }

        return success(res, 'Artist updated successfully', artist);
    }
    catch(error){
        return unknownError(res, error.message)
    }
}



// delete artist by id //

export const deleteArtistById = async (req, res) => {
    try{
        // check if artist already exist
        const artist = await Artist.findByIdAndDelete(req.params.id);

        if(!artist){
            return notFound(res, 'Artist not found');
        }

        return success(res, 'Artist deleted successfully');
    }
    catch(error){
        return unknownError(res, error.message)
    }
}