import React from 'react';
import CatalogCard from './CatalogCard';

const CatalogList = ({ 
  catalogs, 
  onDelete, 
  onSelect, 
  deleteLoading, 
  catalogToDelete 
}) => {
  if (!catalogs || catalogs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>
          No catalogs found. Click &quot;Upload New Catalog&quot; to add one.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: 24,
      padding: '20px 0'
    }}>
      {catalogs.map((catalog) => (
        <CatalogCard
          key={catalog._id}
          catalog={catalog}
          onDelete={onDelete}
          onSelect={onSelect}
          deleteLoading={deleteLoading}
          catalogToDelete={catalogToDelete}
        />
      ))}
    </div>
  );
};

export default CatalogList; 