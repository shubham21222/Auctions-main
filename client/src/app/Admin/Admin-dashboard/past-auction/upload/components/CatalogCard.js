import React from 'react';

const CatalogCard = ({ catalog, onDelete, onSelect, deleteLoading, catalogToDelete }) => {
  return (
    <div 
      className="catalog-card"
      style={{
        border: '1px solid #dee2e6',
        borderRadius: 8,
        padding: 24,
        position: 'relative',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        marginBottom: '20px'
      }}
      onClick={() => onSelect(catalog._id)}
    >
      <div>
        <h3 style={{ 
          margin: '0 0 12px 0',
          fontSize: '1.2em',
          color: '#333'
        }}>
          {catalog.catalogName}
        </h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9em' }}>
              Products: {catalog.products?.length || 0}
            </p>
            {catalog.products && catalog.products.length > 0 && (
              <p style={{ margin: '0', color: '#666', fontSize: '0.9em' }}>
                First Item: {catalog.products[0].title}
              </p>
            )}
          </div>
          <div style={{ 
            padding: '4px 8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            fontSize: '0.8em',
            color: '#495057'
          }}>
            View Details →
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(catalog._id);
        }}
        disabled={deleteLoading}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: '6px 12px',
          background: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: deleteLoading ? 'not-allowed' : 'pointer',
          opacity: deleteLoading ? 0.7 : 1,
          fontSize: '0.9em',
          zIndex: 1
        }}
      >
        {deleteLoading && catalogToDelete === catalog._id ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};

export default CatalogCard; 