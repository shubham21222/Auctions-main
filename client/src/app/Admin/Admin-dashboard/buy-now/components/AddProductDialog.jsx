'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, X, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import config from "@/app/config_BASE_URL";
import { createExcelTemplate } from './createExcelTemplate';

export default function AddProductDialog({ fetchProducts, token, onClose, open, onOpenChange }) {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    estimateprice: "",
    offerAmount: "",
    category: "",
    stock: 1,
    status: "Not Sold",
    sortByPrice: "High Price",
    link: ""
  });

  const [imageInputs, setImageInputs] = useState([
    { type: 'url', value: '', file: null }
  ]);

  const [categories, setCategories] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [parsedProducts, setParsedProducts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const BATCH_SIZE = 10; // Number of products to upload in each batch

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/category/all`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        console.log("Fetched categories:", data.items);
        setCategories(data.items);
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

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      console.log("Excel file selected:", file.name);
    } else {
      setExcelFile(null);
      console.log("Excel file selection cleared");
    }
  };

  const handleExcelUpload = async () => {
    console.log("handleExcelUpload triggered");
    setIsProcessingExcel(true);

    if (!excelFile) {
      toast.error("Please select an Excel file to upload.");
      console.log("No Excel file selected");
      setIsProcessingExcel(false);
      return;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(new Uint8Array(e.target.result));
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(excelFile);
      });

      const workbook = XLSX.read(data, { type: "array" });
      let products = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetProducts = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        if (sheetProducts.length > 0) {
          products = sheetProducts;
          break;
        }
      }

      if (products.length === 0) {
        toast.error("No products found in the Excel file. Please ensure the file has data with the correct column headers.");
        setIsProcessingExcel(false);
        return;
      }

      const mappedProducts = products.map(product => {
        const images = [];
        for (let i = 1; i <= 12; i++) {
          const imageField = product[`ImageFile.${i}`];
          if (imageField) {
            images.push(String(imageField).trim());
          }
        }

        const estimateprice = product.LowEst && product.HighEst 
          ? `$${product.LowEst} - $${product.HighEst}` 
          : "";

        return {
          title: String(product.Title || "").trim(),
          description: String(product.Description || "").trim(),
          price: Number(product.StartPrice || 0),
          estimateprice: estimateprice,
          offerAmount: Number(product["Reserve Price"] || 0),
          category: newProduct.category || "",
          stock: 1,
          status: "Not Sold",
          sortByPrice: String(product.sortByPrice || "High Price").trim(),
          image: images,
          link: String(product.Link || "").trim()
        };
      });

      setParsedProducts(mappedProducts);
      toast.success(`Successfully parsed ${mappedProducts.length} product(s) from the Excel file. Please select a category and click 'Add Product' to upload them.`);
    } catch (error) {
      toast.error("Error parsing Excel file: " + error.message);
      console.error("Error parsing Excel file:", error);
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const uploadBatch = async (products, startIndex) => {
    const batch = products.slice(startIndex, startIndex + BATCH_SIZE);
    const uploadPromises = batch.map(async (product) => {
      const payload = {
        ...product,
        category: newProduct.category,
      };

      if (!payload.title || !payload.price || !payload.category) {
        console.warn("Skipping invalid product:", payload);
        return { success: false, error: "Missing required fields" };
      }

      try {
        const response = await fetch(`${config.baseURL}/v1/api/product/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        if (!responseData.status) {
          throw new Error(responseData.message || "Unknown error");
        }
        return { success: true };
      } catch (error) {
        console.error("Error uploading product:", error);
        return { success: false, error: error.message };
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered");

    try {
      if (parsedProducts.length > 0) {
        if (!newProduct.category) {
          toast.error("Please select a category before uploading products from Excel.");
          return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        let uploadedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < parsedProducts.length; i += BATCH_SIZE) {
          const results = await uploadBatch(parsedProducts, i);
          const successfulUploads = results.filter(r => r.success).length;
          uploadedCount += successfulUploads;
          failedCount += results.length - successfulUploads;
          
          const progress = Math.min(100, Math.round((i + BATCH_SIZE) / parsedProducts.length * 100));
          setUploadProgress(progress);
        }

        if (uploadedCount > 0) {
          toast.success(`Successfully uploaded ${uploadedCount} product(s)!${failedCount > 0 ? ` Failed to upload ${failedCount} product(s).` : ''}`);
          fetchProducts();
        }
        setParsedProducts([]);
        setExcelFile(null);
        onClose();
        return;
      }

      // Otherwise, upload the manually entered product
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
        ...newProduct,
        price: Number(newProduct.price || 0),
        offerAmount: Number(newProduct.offerAmount || 0),
        stock: Number(newProduct.stock || 1),
        image: imageUrls,
      };

      if (!payload.title || !payload.price || !payload.category) {
        toast.error("Please fill in all required fields (Title, Price, Category) before submitting.");
        return;
      }

      const response = await fetch(`${config.baseURL}/v1/api/product/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("API Response (Manual Entry):", responseData);

      if (!responseData.status) {
        throw new Error(`Failed to create product: ${responseData.message || "Unknown error"}`);
      }

      toast.success("Product added successfully!");
      fetchProducts();
      setNewProduct({
        title: "",
        description: "",
        price: "",
        estimateprice: "",
        offerAmount: "",
        category: "",
        stock: 1,
        status: "Not Sold",
        sortByPrice: "High Price",
        link: ""
      });
      setImageInputs([{ type: 'url', value: '', file: null }]);
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.message || "An error occurred while uploading products");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the product details below or upload an Excel file.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Title" id="title" value={newProduct.title} 
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
                <FormField label="Price" id="price" type="number" value={newProduct.price} 
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
              <FormField label="Description" id="description" value={newProduct.description} 
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
              <FormField label="Product URL" id="link" type="url" value={newProduct.link} 
                onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} />
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Pricing Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Estimate Price" id="estimateprice" value={newProduct.estimateprice} 
                  onChange={(e) => setNewProduct({ ...newProduct, estimateprice: e.target.value })} />
                <FormField label="Offer Amount" id="offerAmount" type="number" value={newProduct.offerAmount} 
                  onChange={(e) => setNewProduct({ ...newProduct, offerAmount: e.target.value })} />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Category</h3>
              <SelectField
                label="Category (Required for Excel Upload)"
                id="category"
                value={newProduct.category}
                onChange={(value) => setNewProduct({ ...newProduct, category: value })}
                categories={categories}
                className="bg-white"
              />
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

            {/* Excel Upload Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Bulk Upload</h3>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFileChange}
                  disabled={isProcessingExcel || isUploading}
                />
                <Button
                  onClick={handleExcelUpload}
                  disabled={!excelFile || isProcessingExcel || isUploading}
                >
                  {isProcessingExcel ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Excel"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={createExcelTemplate}
                  disabled={isProcessingExcel || isUploading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading products...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {parsedProducts.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-700">
                    {parsedProducts.length} products ready to upload. Please select a category and click "Add Product" to proceed.
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isUploading || isProcessingExcel}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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

function SelectField({ label, id, value, onChange, categories }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select onValueChange={onChange} value={value} className="bg-white">
        <SelectTrigger>
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