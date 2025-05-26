import PastAuction from '../../models/PastAuction/pastAuctionModel.js';
import PastAuctionProduct from '../../models/PastAuction/pastAuctionProductModel.js';
import { success, badRequest, notFound, serverValidation } from '../../formatters/globalResponse.js';
import mongoose from 'mongoose';

// Create catalog and products from parsed data
export const uploadPastAuctionCatalog = async (req, res) => {
  try {
    const { catalogName, products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return badRequest(res, 'No valid products data provided');
    }

    // Validate required fields in products data - match the schema requirements
    const requiredFields = ['lotNumber', 'title', 'description', 'startPrice', 'finalPrice'];
    const missingFields = [];
    
    products.forEach((product, index) => {
      requiredFields.forEach(field => {
        if (product[field] === undefined || product[field] === null || product[field] === '') {
          missingFields.push(`Product ${index + 1}: Missing ${field}`);
        }
      });
    });

    if (missingFields.length > 0) {
      return badRequest(res, `Missing required fields:\n${missingFields.join('\n')}`);
    }

    try {
      // Insert products first
      const productsResult = await PastAuctionProduct.insertMany(products);
      const productIds = productsResult.map(p => p._id);

      // Then create catalog
      const catalog = await PastAuction.create({
        catalogName: catalogName,
        products: productIds,
        uploadDate: new Date(),
        status: 'active'
      });

      return success(res, 'Catalog uploaded successfully', catalog);

    } catch (error) {
      // If there's an error, try to clean up any products that were inserted
      if (error.name === 'MongoError' && error.code === 11000) {
        return badRequest(res, 'Duplicate entry found. Please check your data.');
      }
      
      // If we get a validation error, it's likely from the product insertion
      if (error instanceof mongoose.Error.ValidationError) {
        return serverValidation(res, error);
      }

      // If we get here, something else went wrong
      console.error('Error during catalog creation:', error);
      throw error;
    }

  } catch (error) {
    console.error('Past auction upload error:', error);
    
    // Handle different types of errors
    if (error instanceof mongoose.Error.ValidationError) {
      return serverValidation(res, error);
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return badRequest(res, 'Duplicate entry found. Please check your data.');
    } else if (error instanceof Error) {
      return serverValidation(res, error.message);
    } else {
      return serverValidation(res, 'An unexpected error occurred while processing your request.');
    }
  }
};

// Delete a catalog and its products
export const deletePastAuctionCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const catalog = await PastAuction.findById(id);
    if (!catalog) return notFound(res, 'Catalog not found');
    // Delete products
    await PastAuctionProduct.deleteMany({ _id: { $in: catalog.products } });
    // Optionally delete file
    if (catalog.fileUrl) {
      const filePath = path.join(process.cwd(), 'server', 'uploads', path.basename(catalog.fileUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await catalog.deleteOne();
    return success(res, 'Catalog and products deleted');
  } catch (error) {
    return serverValidation(res, error.message);
  }
};

// Get all past auction catalogs
export const getPastAuctionCatalogs = async (req, res) => {
  try {
    const catalogs = await PastAuction.find()
      .sort({ uploadedAt: -1 })
      .populate('products', '_id title lotNumber startPrice finalPrice images');

    return success(res, 'Catalogs retrieved successfully', { catalogs });
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    return serverValidation(res, error.message);
  }
};

// Get products for a specific catalog
export const getPastAuctionCatalogProducts = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, 'Invalid catalog ID');
    }

    const catalog = await PastAuction.findById(id).populate('products');
    
    if (!catalog) {
      return notFound(res, 'Catalog not found');
    }

    return success(res, 'Products retrieved successfully', { 
      products: catalog.products,
      catalogName: catalog.catalogName
    });
  } catch (error) {
    console.error('Error fetching catalog products:', error);
    return serverValidation(res, error.message);
  }
}; 