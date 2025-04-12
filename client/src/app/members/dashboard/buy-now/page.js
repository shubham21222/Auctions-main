"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductTable from "./components/ProductTable";
import HeaderSection from "./components/HeaderSection";
import config from "@/app/config_BASE_URL";

export default function BuyNow() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
      />
    </div>
  );
}