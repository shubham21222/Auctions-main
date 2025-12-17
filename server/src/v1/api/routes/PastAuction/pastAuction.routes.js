import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  uploadPastAuctionCatalog, 
  deletePastAuctionCatalog,
  getPastAuctionCatalogs,
  getPastAuctionCatalogProducts,
  debugDatabase
} from '../../controllers/PastAuctionController/pastAuction.controller.js';

const router = express.Router();

// Multer config for Excel files
// Multer config for Excel files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'server', 'uploads');
    // Ensure directory exists
    import('fs').then(fs => {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent path traversal and ensure uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'catalog-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
    // Allow only Excel and CSV files
    const allowedMimeTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];
    // Also check extensions as MIME types can be spoofed or vary
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: fileFilter
});

// Get all catalogs
router.get('/catalogs', getPastAuctionCatalogs);

// Get products for a specific catalog
router.get('/catalog/:id/products', getPastAuctionCatalogProducts);

// Debug endpoint
router.get('/debug', debugDatabase);

// Upload catalog
router.post('/upload', upload.single('catalog'), uploadPastAuctionCatalog);

// Delete catalog
router.delete('/:id', deletePastAuctionCatalog);

export default router; 