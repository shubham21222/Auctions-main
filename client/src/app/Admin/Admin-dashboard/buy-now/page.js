"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductTable from "./components/ProductTable";
import HeaderSection from "./components/HeaderSection";
import config from "@/app/config_BASE_URL";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function BuyNow() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const productsPerPage = 10; // Adjust as needed
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: productsPerPage,
      }).toString();
      const response = await fetch(`${config.baseURL}/v1/api/product/filter?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
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

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/product/bulkdelete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          productIds: selectedProducts
        }),
      });

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

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token, currentPage]); // Re-fetch when page changes

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <HeaderSection fetchProducts={fetchProducts} token={token} />

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <span className="text-sm text-gray-600">
            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
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
    </div>
  );
}