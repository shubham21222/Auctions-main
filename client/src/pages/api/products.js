import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Dynamically resolve the file path
    const filePath = path.join(process.cwd(), 'public', 'products.json');

    // Log the file path for debugging
    console.log('Resolved File Path:', filePath);

    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse the JSON content
    const products = JSON.parse(fileContent);

    // Extract query parameters for pagination
    const { query } = req;
    const limit = parseInt(query.limit, 10) || 20; // Default to 20 products
    const offset = parseInt(query.offset, 10) || 0; // Default to starting at 0

    // Slice the data based on the pagination parameters
    const paginatedData = products.slice(offset, offset + limit);

    // Send the paginated data as JSON
    res.status(200).json({
      products: paginatedData,
      total: products.length, // Include the total number of products for reference
    });
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error.message);
    res.status(500).json({ error: 'Failed to load product data' });
  }
}