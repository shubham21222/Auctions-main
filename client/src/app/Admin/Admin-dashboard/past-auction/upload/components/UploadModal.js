import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [catalogName, setCatalogName] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate required fields
      const requiredFields = ['LotNum', 'Title', 'Description', 'StartPrice'];
      const missingFields = [];
      
      jsonData.forEach((row, index) => {
        requiredFields.forEach(field => {
          if (!row[field]) {
            missingFields.push(`Row ${index + 2}: Missing ${field}`);
          }
        });
      });

      if (missingFields.length > 0) {
        toast.error(`Missing required fields:\n${missingFields.join('\n')}`);
        return;
      }

      // Transform data
      const transformedData = jsonData.map(row => ({
        lotNumber: row['LotNum']?.toString() || '',
        title: row['Title'] || '',
        description: row['Description'] || '',
        condition: row['Condition'] || '',
        startPrice: parseFloat(row['StartPrice']) || 0,
        finalPrice: 0,
        lowEstimate: parseFloat(row['LowEst']) || 0,
        highEstimate: parseFloat(row['HighEst']) || 0,
        reservePrice: parseFloat(row['Reserve Price']) || 0,
        sku: row['Item No']?.toString() || '',
        url: row['Product URI'] || '',
        onlinePrice: parseFloat(row['Online_Price']) || 0,
        sellPrice: parseFloat(row['Sell_Price']) || 0,
        images: [
          ...new Set(
            Object.keys(row)
              .filter(key => /^ImageFile[\\._][0-9]+$/.test(key))
              .map(key => row[key])
              .filter(Boolean)
          )
        ]
      }));

      setParsedData(transformedData);
      setFile(file);
      toast.success(`File parsed successfully. Found ${transformedData.length} items.`);
    } catch (error) {
      toast.error('Error parsing file: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parsedData) {
      toast.error('Please select and parse a file first.');
      return;
    }

    setLoading(true);
    try {
      const success = await onUpload({
        catalogName: catalogName || file.name.replace(/\.[^/.]+$/, ""),
        products: parsedData
      });
      
      if (success) {
        onClose();
        setFile(null);
        setParsedData(null);
        setCatalogName('');
      }
    } catch (error) {
      // Only show error toast if it's not already shown by the parent component
      if (!error.message.includes('Failed to upload catalog')) {
        toast.error('Error uploading catalog: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Upload New Catalog</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Catalog Name (optional)
            </label>
            <input
              type="text"
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              placeholder="Enter catalog name"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Excel File (.xlsx or .xls)
            </label>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
              Required columns: LotNum, Title, Description, StartPrice
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          {parsedData && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Preview</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Lot #</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Title</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Start Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{item.lotNumber}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{item.title}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>${item.startPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p style={{ marginTop: '8px', fontSize: '0.9em', color: '#6c757d' }}>
                    Showing first 5 items of {parsedData.length} total items
                  </p>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !parsedData}
              style={{
                padding: '8px 16px',
                backgroundColor: parsedData ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: parsedData ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal; 