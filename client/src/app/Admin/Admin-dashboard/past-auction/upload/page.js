"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import CatalogList from './components/CatalogList';
import UploadModal from './components/UploadModal';
import { toast } from 'react-hot-toast';
import config from "@/app/config_BASE_URL";

const PastAuctionUpload = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState(null);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchCatalogs = async () => {
    try {
      console.log('Fetching catalogs...');
      const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalogs`);
      console.log('Catalogs API Response:', response.data);
      
      if (response.data.status && response.data.items?.catalogs) {
        const transformedCatalogs = response.data.items.catalogs.map(catalog => ({
          ...catalog,
          productCount: catalog.products?.length || 0,
          firstItemTitle: catalog.products?.[0]?.title || 'No items'
        }));
        console.log('Transformed catalogs:', transformedCatalogs);
        setCatalogs(transformedCatalogs);
      } else {
        console.error('Failed to fetch catalogs:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch catalogs');
      }
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast.error('Error fetching catalogs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (catalogId) => {
    try {
      console.log('Fetching products for catalog:', catalogId);
      const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalog/${catalogId}/products`);
      console.log('Products API Response:', response.data);
      
      if (response.data.status && response.data.items?.products) {
        setProducts(response.data.items.products);
      } else {
        console.error('Failed to fetch products:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteCatalog = async (catalogId) => {
    if (!window.confirm('Are you sure you want to delete this catalog?')) return;
    
    setDeleteLoading(true);
    setCatalogToDelete(catalogId);
    
    try {
      console.log('Deleting catalog:', catalogId);
      const response = await axios.delete(`${config.baseURL}/v1/api/past-auction/${catalogId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.status) {
        toast.success('Catalog deleted successfully');
        setCatalogs(catalogs.filter(cat => cat._id !== catalogId));
        if (selectedCatalog?._id === catalogId) {
          setSelectedCatalog(null);
          setProducts([]);
        }
      } else {
        toast.error(response.data.message || 'Failed to delete catalog');
      }
    } catch (error) {
      console.error('Error deleting catalog:', error);
      toast.error('Error deleting catalog: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteLoading(false);
      setCatalogToDelete(null);
    }
  };

  const handleCatalogSelect = (catalogId) => {
    const selectedCatalog = catalogs.find(cat => cat._id === catalogId);
    if (selectedCatalog) {
      setSelectedCatalog(selectedCatalog);
      fetchProducts(catalogId);
    } else {
      console.error('Catalog not found:', catalogId);
      toast.error('Catalog not found');
    }
  };

  const handleUploadCatalog = async (uploadData) => {
    try {
      const response = await axios.post(`${config.baseURL}/v1/api/past-auction/upload`, uploadData);
      console.log('Upload response:', response.data);
      
      if (response.data.status || response.data.success) {
        toast.success('Catalog uploaded successfully');
        fetchCatalogs(); // Refresh the catalog list
        return true; // Indicate success to the modal
      } else {
        const errorMessage = response.data.message || 'Failed to upload catalog';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading catalog:', error);
      // Don't show error toast here, let the modal handle it
      throw error;
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Past Auction Catalogs</h1>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>+</span> Upload New Catalog
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading catalogs...</p>
        </div>
      ) : (
        <CatalogList
          catalogs={catalogs}
          onDelete={handleDeleteCatalog}
          onSelect={handleCatalogSelect}
          deleteLoading={deleteLoading}
          catalogToDelete={catalogToDelete}
        />
      )}

      {selectedCatalog && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>
            Products in {selectedCatalog.name}
          </h2>
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>{product.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{product.description}</p>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginTop: '10px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadCatalog}
      />
    </div>
  );
};

export default PastAuctionUpload; 