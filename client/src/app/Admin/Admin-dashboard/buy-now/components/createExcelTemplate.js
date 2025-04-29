import * as XLSX from "xlsx";

export function createExcelTemplate() {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Sample data
  const data = [
    {
      Title: 'Vintage Watch',
      Description: 'Luxury vintage watch from 1950',
      StartPrice: 1000,
      LowEst: 800,
      HighEst: 1200,
      'Reserve Price': 900,
      sortByPrice: 'High Price',
      Link: 'https://nyelizabeth.com/products/vintage-watch',
      'ImageFile.1': 'https://example.com/watch1.jpg',
      'ImageFile.2': 'https://example.com/watch2.jpg'
    },
    {
      Title: 'Antique Vase',
      Description: 'Chinese Ming dynasty vase',
      StartPrice: 5000,
      LowEst: 4000,
      HighEst: 6000,
      'Reserve Price': 4500,
      sortByPrice: 'High Price',
      Link: 'https://nyelizabeth.com/products/antique-vase',
      'ImageFile.1': 'https://example.com/vase1.jpg',
      'ImageFile.2': 'https://example.com/vase2.jpg'
    },
    {
      Title: 'Art Deco Lamp',
      Description: 'Beautiful art deco table lamp',
      StartPrice: 750,
      LowEst: 600,
      HighEst: 900,
      'Reserve Price': 700,
      sortByPrice: 'High Price',
      Link: 'https://nyelizabeth.com/products/art-deco-lamp',
      'ImageFile.1': 'https://example.com/lamp1.jpg',
      'ImageFile.2': 'https://example.com/lamp2.jpg'
    }
  ];

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Title
    { wch: 30 }, // Description
    { wch: 12 }, // StartPrice
    { wch: 10 }, // LowEst
    { wch: 10 }, // HighEst
    { wch: 12 }, // Reserve Price
    { wch: 12 }, // sortByPrice
    { wch: 30 }, // Link
    { wch: 30 }, // ImageFile.1
    { wch: 30 }  // ImageFile.2
  ];
  ws['!cols'] = colWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Product Template');

  // Generate the Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  return excelBuffer;
}