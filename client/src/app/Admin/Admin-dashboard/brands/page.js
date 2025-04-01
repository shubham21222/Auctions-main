'use client'
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import config from '@/app/config_BASE_URL';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({
    brandName: '',
    summary: '',
    Biography: '',
    images: ['']
  });
  const [editBrand, setEditBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  const API_URL = `${config.baseURL}/v1/api/brands`;

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL, {
        headers: { Authorization: token }
      });
      const brandData = Array.isArray(response.data.items) ? response.data.items : [];
      setBrands(brandData);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newBrand, {
        headers: { Authorization: token }
      });
      toast.success("Brand created successfully");
      fetchBrands();
      setNewBrand({ brandName: '', summary: '', Biography: '', images: [''] });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error("Failed to create brand");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: token }
      });
      toast.success("Brand deleted successfully");
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error("Failed to delete brand");
    }
  };

  const handleUpdate = (brand) => {
    setEditBrand({ ...brand, images: brand.images || [''] });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${editBrand._id}`, editBrand, {
        headers: { Authorization: token }
      });
      toast.success("Brand updated successfully");
      fetchBrands();
      setIsEditModalOpen(false);
      setEditBrand(null);
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error("Failed to update brand");
    }
  };

  const addImageField = (isEdit = false) => {
    if (isEdit) {
      setEditBrand({
        ...editBrand,
        images: [...editBrand.images, '']
      });
    } else {
      setNewBrand({
        ...newBrand,
        images: [...newBrand.images, '']
      });
    }
  };

  const updateImage = (index, value, isEdit = false) => {
    if (isEdit) {
      const newImages = [...editBrand.images];
      newImages[index] = value;
      setEditBrand({ ...editBrand, images: newImages });
    } else {
      const newImages = [...newBrand.images];
      newImages[index] = value;
      setNewBrand({ ...newBrand, images: newImages });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Brands Management</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new brand.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Name</label>
                <Input
                  placeholder="Enter brand name"
                  value={newBrand.brandName}
                  onChange={(e) => setNewBrand({ ...newBrand, brandName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Input
                  placeholder="Enter brand summary"
                  value={newBrand.summary}
                  onChange={(e) => setNewBrand({ ...newBrand, summary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Biography</label>
                <Textarea
                  placeholder="Enter brand biography"
                  value={newBrand.Biography}
                  onChange={(e) => setNewBrand({ ...newBrand, Biography: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Images</label>
                {newBrand.images.map((img, index) => (
                  <Input
                    key={index}
                    placeholder={`Image URL ${index + 1}`}
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="mb-2"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addImageField()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image URL
                </Button>
              </div>
              <Button type="submit" className="w-full">
                Create Brand
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading brands...
                    </div>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No brands found
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {brand.brandName || 'Unnamed Brand'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {brand.summary || 'No summary'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {brand.createdBy?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdate(brand)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(brand._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Modify the details of the brand.
            </DialogDescription>
          </DialogHeader>
          {editBrand && (
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Name</label>
                <Input
                  placeholder="Enter brand name"
                  value={editBrand.brandName}
                  onChange={(e) => setEditBrand({ ...editBrand, brandName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Input
                  placeholder="Enter brand summary"
                  value={editBrand.summary}
                  onChange={(e) => setEditBrand({ ...editBrand, summary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Biography</label>
                <Textarea
                  placeholder="Enter brand biography"
                  value={editBrand.Biography}
                  onChange={(e) => setEditBrand({ ...editBrand, Biography: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Images</label>
                {editBrand.images.map((img, index) => (
                  <Input
                    key={index}
                    placeholder={`Image URL ${index + 1}`}
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value, true)}
                    className="mb-2"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addImageField(true)}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image URL
                </Button>
              </div>
              <Button type="submit" className="w-full">
                Update Brand
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsPage;