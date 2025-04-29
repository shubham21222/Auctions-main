'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, X, Download } from "lucide-react";
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

    if (!excelFile) {
      toast.error("Please select an Excel file to upload.");
      console.log("No Excel file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        console.log("Available sheets in Excel file:", workbook.SheetNames);

        let products = [];
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          console.log("Raw worksheet data for sheet", sheetName, ":", worksheet);
          const sheetProducts = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          if (sheetProducts.length > 0) {
            products = sheetProducts;
            console.log(`Found data in sheet: ${sheetName}`);
            break;
          }
        }

        console.log("Parsed Excel Data:", products);

        if (products.length === 0) {
          toast.error("No products found in the Excel file. Please ensure the file has data with the correct column headers.");
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
        console.log("Mapped Products:", mappedProducts);
      } catch (error) {
        toast.error("Error parsing Excel file: " + error.message);
        console.error("Error parsing Excel file:", error);
      }
    };

    reader.onerror = (error) => {
      toast.error("Error reading Excel file: " + error.message);
      console.error("Error reading Excel file:", error);
    };

    reader.readAsArrayBuffer(excelFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered");

    try {
      // If there are parsed products from Excel, upload them
      if (parsedProducts.length > 0) {
        if (!newProduct.category) {
          toast.error("Please select a category before uploading products from Excel.");
          return;
        }

        let uploadedCount = 0;
        for (const product of parsedProducts) {
          const payload = {
            ...product,
            category: newProduct.category,
          };

          console.log("Product payload:", payload);

          if (!payload.title || !payload.price || !payload.category) {
            console.warn("Skipping invalid product:", payload);
            toast.error(`Skipping invalid product: Missing required fields in row - ${JSON.stringify(product)}`);
            continue;
          }

          const categoryExists = categories.some(cat => cat._id === payload.category);
          if (!categoryExists) {
            console.warn("Invalid category for product:", payload);
            toast.error(`Skipping product: Invalid category ID "${payload.category}" in row - ${JSON.stringify(product)}`);
            continue;
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
          console.log("API Response (Excel Upload):", responseData);

          if (!responseData.status) {
            throw new Error(`Failed to create product: ${responseData.message || "Unknown error"}`);
          }

          uploadedCount++;
        }

        if (uploadedCount > 0) {
          toast.success(`Successfully uploaded ${uploadedCount} product(s)!`);
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
      toast.error("Error creating product: " + error.message);
      console.error("Error creating product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to the Buy Now section. If uploading from Excel, please select a category below.
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
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleExcelFileChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExcelUpload}
                  disabled={!excelFile}
                  className="shrink-0"
                >
                  Upload Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const excelBuffer = createExcelTemplate();
                    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'product_upload_template.xlsx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 shrink-0"
                >
                  <Download className="h-4 w-4" /> Sample
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Product</Button>
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