import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditSellerModal = ({ seller, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    General: { ...seller.General },
    Measurement: { ...seller.Measurement },
    Condition: { ...seller.Condition },
    Provenance: { ...seller.Provenance },
    price: { ...seller.price },
    logistic_info: { ...seller.logistic_info },
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(seller._id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating seller:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Seller Details - {seller.General?.object}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="object">Object Name</Label>
                <Input
                  id="object"
                  value={formData.General.object || ''}
                  onChange={(e) => handleInputChange('General', 'object', e.target.value)}
                  placeholder="Enter object name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.General.description || ''}
                  onChange={(e) => handleInputChange('General', 'description', e.target.value)}
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Price Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paidPrice">Price</Label>
                <Input
                  id="paidPrice"
                  type="number"
                  value={formData.price.paidPrice || ''}
                  onChange={(e) => handleInputChange('price', 'paidPrice', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.price.currency || 'USD'}
                  onValueChange={(value) => handleInputChange('price', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.Measurement.height || ''}
                  onChange={(e) => handleInputChange('Measurement', 'height', e.target.value)}
                  placeholder="Enter height"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={formData.Measurement.width || ''}
                  onChange={(e) => handleInputChange('Measurement', 'width', e.target.value)}
                  placeholder="Enter width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depth">Depth</Label>
                <Input
                  id="depth"
                  value={formData.Measurement.depth || ''}
                  onChange={(e) => handleInputChange('Measurement', 'depth', e.target.value)}
                  placeholder="Enter depth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.Measurement.weight || ''}
                  onChange={(e) => handleInputChange('Measurement', 'weight', e.target.value)}
                  placeholder="Enter weight"
                />
              </div>
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Condition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.Condition.condition || ''}
                  onValueChange={(value) => handleInputChange('Condition', 'condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditionNotes">Condition Notes</Label>
                <Textarea
                  id="conditionNotes"
                  value={formData.Condition.notes || ''}
                  onChange={(e) => handleInputChange('Condition', 'notes', e.target.value)}
                  placeholder="Enter condition notes"
                />
              </div>
            </div>
          </div>

          {/* Logistics Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Logistics Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.logistic_info.firstName || ''}
                  onChange={(e) => handleInputChange('logistic_info', 'firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.logistic_info.lastName || ''}
                  onChange={(e) => handleInputChange('logistic_info', 'lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.logistic_info.email || ''}
                  onChange={(e) => handleInputChange('logistic_info', 'email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.logistic_info.phone || ''}
                  onChange={(e) => handleInputChange('logistic_info', 'phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.logistic_info.country || ''}
                  onChange={(e) => handleInputChange('logistic_info', 'country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.logistic_info.city || ''}
                  onChange={(e) => handleInputChange('logistic_info', 'city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSellerModal; 