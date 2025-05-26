import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  uploadPastAuctionCatalog, 
  deletePastAuctionCatalog,
  getPastAuctionCatalogs,
  getPastAuctionCatalogProducts 
} from '../../controllers/PastAuctionController/pastAuction.controller.js';

const router = express.Router();

// Multer config for Excel files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'server', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all catalogs
router.get('/catalogs', getPastAuctionCatalogs);

// Get products for a specific catalog
router.get('/catalog/:id/products', getPastAuctionCatalogProducts);

// Upload catalog
router.post('/upload', upload.single('catalog'), uploadPastAuctionCatalog);

// Delete catalog
router.delete('/:id', deletePastAuctionCatalog);

export default router; 