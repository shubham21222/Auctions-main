import express from 'express';
import {toggleFavorite , getAllFavorites , deleteFavorite } from '../../controllers/FavoriteController/favorite.controller.js';
import { IsAuthenticated , authorizeRoles } from '../../middlewares/authicationmiddleware.js';

const router = express.Router();



router.post('/toggle', IsAuthenticated , toggleFavorite);
router.get('/all', IsAuthenticated ,  getAllFavorites);
router.delete('/delete', deleteFavorite);

export default router;