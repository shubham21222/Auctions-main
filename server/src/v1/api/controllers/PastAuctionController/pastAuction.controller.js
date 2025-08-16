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
    const { page = 1, limit = 20, sortBy = 'uploadedAt', sortOrder = 'desc' } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return badRequest(res, 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100');
    }

    // Build sort object
    const sortObj = {};
    if (sortBy === 'uploadedAt') {
      sortObj.uploadedAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'catalogName') {
      sortObj.catalogName = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj.uploadedAt = -1; // default sort
    }

    // Get total count for pagination
    const totalCatalogs = await PastAuction.countDocuments();

    // Get paginated catalogs WITHOUT populate to avoid slow loading
    const catalogs = await PastAuction.find()
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select('_id catalogName createdAt updatedAt products'); // Include products array for count

    // Add product count to each catalog
    const catalogsWithCount = catalogs.map(catalog => ({
      _id: catalog._id,
      catalogName: catalog.catalogName,
      createdAt: catalog.createdAt,
      updatedAt: catalog.updatedAt,
      productCount: catalog.products ? catalog.products.length : 0
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCatalogs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Add caching headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('ETag', `catalogs-${pageNum}-${limitNum}-${sortBy}-${sortOrder}`);

    return success(res, 'Catalogs retrieved successfully', { 
      catalogs: catalogsWithCount,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCatalogs,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    return serverValidation(res, error.message);
  }
};

// Get products for a specific catalog
export const getPastAuctionCatalogProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, sortBy = 'lotNumber', sortOrder = 'asc' } = req.query;

    console.log(`🔍 Fetching products for catalog: ${id}`);
    console.log(`📋 Query params: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid catalog ID format');
      return badRequest(res, 'Invalid catalog ID');
    }

    // First, get the catalog with populated products to get the product IDs
    console.log('📚 Fetching catalog from database...');
    const catalog = await PastAuction.findById(id).populate('products', '_id');
    
    if (!catalog) {
      console.log('❌ Catalog not found in database');
      return notFound(res, 'Catalog not found');
    }

    console.log(`📚 Catalog found: ${catalog.catalogName}`);
    console.log(`🔗 Catalog products array length: ${catalog.products ? catalog.products.length : 0}`);
    console.log(`🔗 Catalog products array:`, catalog.products);
    console.log(`🔗 Catalog products array type:`, Array.isArray(catalog.products) ? 'Array' : typeof catalog.products);

    // Extract product IDs from the populated catalog
    const productIds = catalog.products.map(product => product._id);
    console.log(`🆔 Product IDs extracted: ${productIds.length}`);
    console.log(`🆔 Product IDs:`, productIds);
    
    if (!productIds || productIds.length === 0) {
      console.log('⚠️ No products found in catalog');
      return success(res, 'No products found in this catalog', { 
        products: [],
        catalogName: catalog.catalogName,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: parseInt(limit, 10)
        }
      });
    }

    // Parse pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return badRequest(res, 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100');
    }

    // Build sort object
    const sortObj = {};
    if (sortBy === 'lotNumber') {
      sortObj.lotNumber = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'title') {
      sortObj.title = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'startPrice') {
      sortObj.startPrice = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'finalPrice') {
      sortObj.finalPrice = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj.lotNumber = 1; // default sort
    }

    // Get total count for pagination
    console.log(`🔢 Counting total products with IDs: ${productIds.slice(0, 5).join(', ')}...`);
    const totalProducts = await PastAuctionProduct.countDocuments({ _id: { $in: productIds } });
    console.log(`📊 Total products found: ${totalProducts}`);

    // Test query - let's see if we can find ANY products
    const testProduct = await PastAuctionProduct.findOne();
    console.log(`🧪 Test product found: ${testProduct ? testProduct._id : 'None'}`);
    
    // Test query with just the first product ID
    if (productIds.length > 0) {
      const testSpecificProduct = await PastAuctionProduct.findById(productIds[0]);
      console.log(`🎯 Test specific product (${productIds[0]}): ${testSpecificProduct ? testSpecificProduct.title : 'Not found'}`);
    }

    // Get paginated products with only essential fields
    console.log(`📥 Fetching products: skip=${skip}, limit=${limitNum}`);
    console.log(`🔍 Query: { _id: { $in: [${productIds.slice(0, 3).join(', ')}...] } }`);
    
    const products = await PastAuctionProduct.find({ _id: { $in: productIds } })
      .select('_id lotNumber title startPrice finalPrice lowEstimate highEstimate condition sku images createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    console.log(`✅ Products fetched successfully: ${products.length} products`);
    if (products.length > 0) {
      console.log(`📋 First product: ${products[0].title} (ID: ${products[0]._id})`);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Add caching headers
    // res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    // res.set('ETag', `products-${id}-${pageNum}-${limitNum}-${sortBy}-${sortOrder}`);
    
    // Temporarily disable caching for debugging
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const response = {
      products,
      catalogName: catalog.catalogName,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    };

    console.log(`🎯 Sending response with ${products.length} products, total: ${totalProducts}`);
    return success(res, 'Products retrieved successfully', response);
  } catch (error) {
    console.error('❌ Error fetching catalog products:', error);
    return serverValidation(res, error.message);
  }
}; 

// Debug endpoint to check database contents
export const debugDatabase = async (req, res) => {
  try {
    const catalogCount = await PastAuction.countDocuments();
    const productCount = await PastAuctionProduct.countDocuments();
    
    // Get a sample catalog
    const sampleCatalog = await PastAuction.findOne().populate('products', '_id');
    
    return success(res, 'Database debug info', {
      catalogCount,
      productCount,
      sampleCatalog: sampleCatalog ? {
        _id: sampleCatalog._id,
        catalogName: sampleCatalog.catalogName,
        productCount: sampleCatalog.products ? sampleCatalog.products.length : 0,
        productIds: sampleCatalog.products ? sampleCatalog.products.map(p => p._id) : []
      } : null
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return serverValidation(res, error.message);
  }
}; 