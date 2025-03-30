import express from 'express';
const router = express.Router();

import {createArtist , getAllArtists , getArtistById , updateArtistById , deleteArtistById } from '../../controllers/ArtistController/artist.controller.js';
import { IsAuthenticated ,  authorizeRoles, authorizeBackendRole} from  "../../middlewares/authicationmiddleware.js"

// POST /api/artists

router.post('/', IsAuthenticated ,authorizeBackendRole , createArtist);

// GET /api/artists

router.get('/', getAllArtists);

// GET /api/artists/:id

router.get('/:id', getArtistById);


// PUT /api/artists/:id

router.post('/:id',  IsAuthenticated , authorizeBackendRole ,  updateArtistById);

// DELETE /api/artists/:id

router.delete('/:id', IsAuthenticated ,authorizeBackendRole ,  deleteArtistById);

export default router;


// Define an array to store the notes
