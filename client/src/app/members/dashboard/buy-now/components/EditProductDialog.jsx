'use client';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-hot-toast"; // Import toast from react-hot-toast
import config from "@/app/config_BASE_URL";

export default function EditProductDialog({ product, fetchProducts, token, onClose }) {
  const [editingProduct, setEditingProduct] = useState(product);
  const [imagePreview, setImagePreview] = useState(product.image?.[0] || ""); // For image preview

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Update the preview
        setEditingProduct({ ...editingProduct, image: [reader.result] }); // Update the product state
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating product:", editingProduct); // Debugging log
      const response = await fetch(`${config.baseURL}/v1/api/product/update/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(editingProduct),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Log API error details
        console.error("API Error Response:", errorData);
        throw new Error("Failed to update product");
      }

      // Show success toast
      toast.success("Product edited successfully!", {
        style: {
          background: "#4CAF50", // Green background
          color: "#FFFFFF", // White text
        },
      });

      // Refresh the product list
      fetchProducts();

      // Close the dialog
      onClose(); // Call the onClose prop to close the dialog
    } catch (error) {
      console.error("Error updating product:", error);

      // Show error toast
      toast.error("Failed to update product. Please try again.", {
        style: {
          background: "#FF5733", // Red background
          color: "#FFFFFF", // White text
        },
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 shadow-lg rounded-lg">
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogDescription>Update an existing product.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          {/* Title Field */}
          <FormField
            label="Title"
            id="title"
            value={editingProduct.title}
            onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
          />

          {/* Description Field */}
          <FormField
            label="Description"
            id="description"
            value={editingProduct.description}
            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
          />

          {/* Price Field */}
          <FormField
            label="Price"
            id="price"
            type="number"
            value={editingProduct.price}
            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
          />

          {/* Category Field */}
          <SelectField
            label="Category"
            id="category"
            value={editingProduct.category?._id || ""}
            onChange={(value) => setEditingProduct({ ...editingProduct, category: { _id: value } })}
          />

          {/* Stock Field */}
          <FormField
            label="Stock"
            id="stock"
            type="number"
            value={editingProduct.stock || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
          />

          {/* Image Upload Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <div className="col-span-3 space-y-2">
              {/* Image Preview */}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}
              {/* File Input */}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="col-span-3"
              />
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
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input id={id} type={type} value={value} onChange={onChange} className="col-span-3" />
    </div>
  );
}

// Reusable Select Field Component
function SelectField({ label, id, value, onChange }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="67a8643adc96bf86883785c4">FASHION</SelectItem>
          <SelectItem value="67a86485dc96bf86883785cc">JEWELRY</SelectItem>
          <SelectItem value="67aacb6f376f82a7736b3616">OTHERS</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}