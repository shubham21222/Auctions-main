"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductTable from "./components/ProductTable";
import HeaderSection from "./components/HeaderSection";
import SkuSearchModal from "./components/SkuSearchModal";
import config from "@/app/config_BASE_URL";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BuyNow() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdjustingPrices, setIsAdjustingPrices] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showSkuSearch, setShowSkuSearch] = useState(false);
  const productsPerPage = 10;
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/category/all`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.items || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: productsPerPage,
      });
      if (selectedCategories.length > 0) {
        queryParams.set("category", selectedCategories.join(","));
      }
      const response = await fetch(
        `${config.baseURL}/v1/api/product/filter?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      const fetchedProducts = data.items?.items || [];
      setProducts(fetchedProducts);
      setTotalItems(data.items?.total || 0);
      setTotalPages(data.items?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/product/bulkdelete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            productIds: selectedProducts,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to delete products");

      const data = await response.json();
      if (data.status) {
        toast.success("Products deleted successfully");
        setSelectedProducts([]);
        fetchProducts();
      } else {
        throw new Error(data.message || "Failed to delete products");
      }
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error(error.message || "Failed to delete products");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePriceAdjustment = async (percentage) => {
    if (
      !confirm(
        `Are you sure you want to ${
          percentage > 0 ? "increase" : "decrease"
        } all product prices by ${Math.abs(percentage)}%?`
      )
    ) {
      return;
    }

    setIsAdjustingPrices(true);
    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/product/adjust-all-estimate-prices`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            percentage: percentage,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to adjust prices");

      const data = await response.json();
      if (data.status) {
        toast.success(
          `Successfully updated estimate prices for ${
            data.items?.length || 0
          } product(s)`
        );
        setShowPriceDialog(false);
        setPriceAdjustment(0);
        fetchProducts();
      } else {
        throw new Error(data.message || "Failed to adjust prices");
      }
    } catch (error) {
      console.error("Error adjusting prices:", error);
      toast.error(error.message || "Failed to adjust prices");
    } finally {
      setIsAdjustingPrices(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token, currentPage, selectedCategories]); // Re-fetch when categories change

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCurrentPage(1); // Reset to first page on filter change
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProductFound = (product) => {
    // If the product is not already in the list, add it
    if (!products.some(p => p._id === product._id)) {
      setProducts(prev => [product, ...prev]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <HeaderSection fetchProducts={fetchProducts} token={token} />

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Search & Filter</h3>
          <Button
            onClick={() => setShowSkuSearch(true)}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700"
          >
            Search by SKU
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={selectedCategories.includes(category._id) ? "default" : "outline"}
              onClick={() => handleCategoryChange(category._id)}
              className="px-4 py-2"
            >
              {category.name}
            </Button>
          ))}
          {categories.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategories([]);
                setCurrentPage(1);
              }}
              className="px-4 py-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Price Adjustment Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Bulk Price Adjustment</h3>
        <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              Adjust All Product Prices
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adjust Product Prices</DialogTitle>
              <DialogDescription>
                Enter the percentage to adjust all product prices. Use positive
                values to increase prices and negative values to decrease prices.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage" className="text-right">
                  Percentage
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                  className="col-span-3"
                  placeholder="Enter percentage (e.g., 10 or -5)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPriceDialog(false)}
                disabled={isAdjustingPrices}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePriceAdjustment(priceAdjustment)}
                disabled={isAdjustingPrices || priceAdjustment === 0}
                className={
                  priceAdjustment > 0
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isAdjustingPrices
                  ? "Adjusting..."
                  : priceAdjustment > 0
                  ? "Increase Prices"
                  : "Decrease Prices"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <span className="text-sm text-gray-600">
            {selectedProducts.length} product
            {selectedProducts.length > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="ml-auto"
          >
            {isDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      )}

      {/* Product Table */}
      <ProductTable
        products={products}
        fetchProducts={fetchProducts}
        token={token}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        productsPerPage={productsPerPage}
        handlePageChange={handlePageChange}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
      />

      {/* SKU Search Modal */}
      <SkuSearchModal
        isOpen={showSkuSearch}
        onClose={() => setShowSkuSearch(false)}
        onProductFound={handleProductFound}
      />
    </div>
  );
}