'use client';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-hot-toast"; // Import toast from react-hot-toast
import config from "@/app/config_BASE_URL";
import { Plus, X } from "lucide-react";

export default function EditProductDialog({ product, fetchProducts, token, onClose }) {
  const [editingProduct, setEditingProduct] = useState({
    ...product,
    category: product.category?._id || product.category || "",
    status: product.status || "Not Sold",
    sortByPrice: product.sortByPrice || "Low Price",
    type: product.type || "",
    link: product.link || "",
    sku: product.sku || "",
    favorite: product.favorite || false,
    details: product.details || []
  });
  const [imageInputs, setImageInputs] = useState(
    product.image?.map(url => ({ type: 'url', value: url, file: null })) || [{ type: 'url', value: '', file: null }]
  );

  const handleImageTypeToggle = (index) => {
    setImageInputs(prev => prev.map((input, i) => 
      i === index ? {
        ...input,
        type: input.type === 'url' ? 'file' : 'url',
        value: '',
        file: null
      } : input
    ));
  };

  const handleImageChange = (index, value, file = null) => {
    setImageInputs(prev => prev.map((input, i) => 
      i === index ? { ...input, value, file } : input
    ));
  };

  const addMoreImage = () => {
    setImageInputs(prev => [...prev, { type: 'url', value: '', file: null }]);
  };

  const removeImage = (index) => {
    setImageInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Process images
      const imageUrls = [];
      for (const input of imageInputs) {
        if (input.type === 'url' && input.value) {
          imageUrls.push(input.value);
        } else if (input.type === 'file' && input.file) {
          const formData = new FormData();
          formData.append("file", input.file);

          const uploadResponse = await fetch(`${config.baseURL}/v1/api/uploadImg/upload`, {
            method: "POST",
            headers: {
              Authorization: `${token}`,
            },
            body: formData,
          });

          if (!uploadResponse.ok) throw new Error("Failed to upload image");
          const uploadData = await uploadResponse.json();
          imageUrls.push(uploadData.url);
        }
      }

      const payload = {
        ...editingProduct,
        image: imageUrls,
        price: Number(editingProduct.price || 0),
        offerAmount: Number(editingProduct.offerAmount || 0),
        stock: Number(editingProduct.stock || 1),
      };

      const response = await fetch(`${config.baseURL}/v1/api/product/update/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully!");
      fetchProducts();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogDescription>Update product details below.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Title"
                id="title"
                value={editingProduct.title}
                onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
              />
              <FormField
                label="SKU"
                id="sku"
                value={editingProduct.sku}
                onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
              />
            </div>
            <FormField
              label="Description"
              id="description"
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
            <FormField
              label="Product URL"
              id="link"
              type="url"
              value={editingProduct.link}
              onChange={(e) => setEditingProduct({ ...editingProduct, link: e.target.value })}
            />
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Pricing Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Price"
                id="price"
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
              />
              <FormField
                label="Estimate Price"
                id="estimateprice"
                value={editingProduct.estimateprice}
                onChange={(e) => setEditingProduct({ ...editingProduct, estimateprice: e.target.value })}
              />
              <FormField
                label="Offer Amount"
                id="offerAmount"
                type="number"
                value={editingProduct.offerAmount}
                onChange={(e) => setEditingProduct({ ...editingProduct, offerAmount: e.target.value })}
              />
              <FormField
                label="Stock"
                id="stock"
                type="number"
                value={editingProduct.stock}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
              />
            </div>
          </div>

          {/* Category and Status Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Category & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Category"
                id="category"
                value={editingProduct.category}
                onChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
              />
              <SelectField
                label="Status"
                id="status"
                value={editingProduct.status}
                onChange={(value) => setEditingProduct({ ...editingProduct, status: value })}
                options={[
                  { value: "Not Sold", label: "Not Sold" },
                  { value: "Sold", label: "Sold" }
                ]}
              />
              <SelectField
                label="Sort By Price"
                id="sortByPrice"
                value={editingProduct.sortByPrice}
                onChange={(value) => setEditingProduct({ ...editingProduct, sortByPrice: value })}
                options={[
                  { value: "Low Price", label: "Low Price" },
                  { value: "High Price", label: "High Price" }
                ]}
              />
              <SelectField
                label="Type"
                id="type"
                value={editingProduct.type}
                onChange={(value) => setEditingProduct({ ...editingProduct, type: value })}
                options={[
                  { value: "Jewelry", label: "Jewelry" },
                  { value: "Fashion", label: "Fashion" },
                  { value: "Others", label: "Others" }
                ]}
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Product Images</h3>
            <div className="space-y-2">
              {imageInputs.map((input, index) => (
                <div key={index} className="flex items-center gap-2">
                  {input.type === 'url' ? (
                    <Input
                      type="url"
                      placeholder="Enter image URL"
                      value={input.value}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e.target.value, e.target.files[0])}
                      className="flex-1"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleImageTypeToggle(index)}
                    className="shrink-0"
                  >
                    {input.type === 'url' ? 'File' : 'URL'}
                  </Button>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addMoreImage}
                className="flex items-center gap-2 w-full"
              >
                <Plus className="h-4 w-4" /> Add More Images
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Update Product</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Reusable Form Field Component
function FormField({ label, id, type = "text", value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input id={id} type={type} value={value} onChange={onChange} />
    </div>
  );
}

// Reusable Select Field Component
function SelectField({ label, id, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options ? (
            options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <>
              <SelectItem value="67a8643adc96bf86883785c4">FASHION</SelectItem>
              <SelectItem value="67a86485dc96bf86883785cc">JEWELRY</SelectItem>
              <SelectItem value="67aacb6f376f82a7736b3616">OTHERS</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}