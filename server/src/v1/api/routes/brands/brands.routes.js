import express from 'express';
const router = express.Router();

import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"

import {createBrand , getAllBrands , getBrandById , updateBrandById , deleteBrandById} from '../../controllers/brandController/brand.controller.js';

// Create a brand

router.post('/',  IsAuthenticated , authorizeRoles("ADMIN") , createBrand);

// Get all brands

router.get('/', getAllBrands);

// Get a single brand

router.get('/:id',  getBrandById);

// Update a brand

router.post('/:id',  IsAuthenticated , authorizeRoles("ADMIN") , updateBrandById);

// Delete a brand

router.delete('/:id', IsAuthenticated , authorizeRoles("ADMIN") ,  deleteBrandById);

export default router;

