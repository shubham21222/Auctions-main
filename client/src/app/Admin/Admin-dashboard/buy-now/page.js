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
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const productsPerPage = 10;
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

      // Add category filter
      if (selectedCategories.length > 0) {
        queryParams.set("category", selectedCategories.join(","));
      }

      // Add status filter
      if (selectedStatus) {
        queryParams.set("status", selectedStatus);
      }

      // Add search query
      if (searchQuery) {
        queryParams.set("searchQuery", searchQuery);
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
  }, [token, currentPage, selectedCategories, selectedStatus, searchQuery]);

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

  const handleStatusChange = (status) => {
    setCurrentPage(1);
    setSelectedStatus(status);
  };

  const handleSearch = (query) => {
    setCurrentPage(1);
    setSearchQuery(query);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedStatus("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleProductFound = (product) => {
    // If the product is not already in the list, add it
    if (!products.some(p => p._id === product._id)) {
      setProducts(prev => [product, ...prev]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header Section with Stats and Filter Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <p className="text-sm text-gray-500 mt-1">
                Total {totalItems} products found
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(selectedCategories.length > 0 || selectedStatus || searchQuery) && (
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {selectedCategories.length + (selectedStatus ? 1 : 0) + (searchQuery ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filter Products</SheetTitle>
                    {(selectedCategories.length > 0 || selectedStatus || searchQuery) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Reset all filters
                      </Button>
                    )}
                  </SheetHeader>

                  <div className="space-y-8">
                    {/* Search Section */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Search</h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full pl-9"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => handleSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Categories Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Categories</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {categories.map((category) => (
                          <div key={category._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={category._id}
                              checked={selectedCategories.includes(category._id)}
                              onCheckedChange={(checked) => handleCategoryChange(category._id)}
                            />
                            <Label htmlFor={category._id} className="cursor-pointer text-sm">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Status</h4>
                      <div className="space-y-2">
                        {["Sold", "Not Sold"].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={status}
                              checked={selectedStatus === status}
                              onCheckedChange={() => handleStatusChange(status)}
                            />
                            <Label htmlFor={status} className="cursor-pointer text-sm">
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                onClick={() => setShowSkuSearch(true)}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700"
              >
                Search by SKU
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPriceDialog(true)}
                className="bg-green-50 hover:bg-green-100 text-green-700"
              >
                Adjust Prices
              </Button>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="w-full">
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
        </div>
      </div>

      {/* Price Adjustment Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
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

      {/* SKU Search Modal */}
      <SkuSearchModal
        isOpen={showSkuSearch}
        onClose={() => setShowSkuSearch(false)}
        onProductFound={handleProductFound}
      />
    </div>
  );
}