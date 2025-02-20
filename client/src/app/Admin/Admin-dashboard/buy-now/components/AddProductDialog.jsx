'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, X } from "lucide-react";

export default function AddProductDialog({ fetchProducts, token, onClose, open, onOpenChange }) {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    estimateprice: "",
    offerAmount: "",
    category: "", // Store category ID here
    stock: "",
    status: "Not Sold",
    sortByPrice: "High Price",
    // details: [{
    //   key: "",
    //   value: ""
    // }]
  });

  const [imageInputs, setImageInputs] = useState([
    { type: 'url', value: '', file: null }
  ]);

  const [categories, setCategories] = useState([]); // To store fetched categories

  // Fetch all categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://bid.nyelizabeth.com/v1/api/category/all");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.items); // Store the categories in state
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories. Please try again.");
      }
    };

    fetchCategories();
  }, []);

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
      // Handle image uploads and collect URLs
      const imageUrls = [];
      for (const input of imageInputs) {
        if (input.type === 'url' && input.value) {
          imageUrls.push(input.value);
        } else if (input.type === 'file' && input.file) {
          const formData = new FormData();
          formData.append("file", input.file);

          const uploadResponse = await fetch("https://bid.nyelizabeth.com/v1/api/uploadImg/upload", {
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
        ...newProduct,
        image: imageUrls,
        createdAt: new Date().toISOString()
      };

      const response = await fetch("https://bid.nyelizabeth.com/v1/api/product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create product");
      
      toast.success("Product added successfully!");
      fetchProducts();
      setNewProduct({
        title: "",
        description: "",
        price: "",
        estimateprice: "",
        offerAmount: "",
        category: "",
        stock: "",
        status: "Not Sold",
        sortByPrice: "High Price",
        details: [{ key: "", value: "" }]
      });
      setImageInputs([{ type: 'url', value: '', file: null }]);
      onClose();
    } catch (error) {
      toast.error("Error creating product: " + error.message);
      console.error("Error creating product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Add a new product to the Buy Now section.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label="Title" id="title" value={newProduct.title} 
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
            <FormField label="Description" id="description" value={newProduct.description} 
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            <FormField label="Price" id="price" type="number" value={newProduct.price} 
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            <FormField label="Estimate Price" id="estimateprice" value={newProduct.estimateprice} 
              onChange={(e) => setNewProduct({ ...newProduct, estimateprice: e.target.value })} />
            <FormField label="Offer Amount" id="offerAmount" type="number" value={newProduct.offerAmount} 
              onChange={(e) => setNewProduct({ ...newProduct, offerAmount: e.target.value })} />

            <SelectField
              label="Category"
              id="category"
              value={newProduct.category}
              onChange={(value) => setNewProduct({ ...newProduct, category: value })}
              categories={categories} // Pass fetched categories to the SelectField
              className="bg-white"
            />

            {imageInputs.map((input, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Image {index + 1}</Label>
                <div className="col-span-3 flex gap-2">
                  {input.type === 'url' ? (
                    <Input
                      type="url"
                      placeholder="Enter image URL"
                      value={input.value}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                    />
                  ) : (
                    <Input
                      type="file"
                      onChange={(e) => handleImageChange(index, e.target.value, e.target.files[0])}
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleImageTypeToggle(index)}
                  >
                    {input.type === 'url' ? 'File' : 'URL'}
                  </Button>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addMoreImage}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add More Images
            </Button>
          </div>
          <DialogFooter>
            <Button type="submit">Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
function SelectField({ label, id, value, onChange, categories }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Select onValueChange={onChange} value={value} className="bg-white">
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {categories.map((category) => (
            <SelectItem key={category._id} value={category._id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}