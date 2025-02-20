"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductTable from "./components/ProductTable";
import AddProductDialog from "./components/AddProductDialog";
import HeaderSection from "./components/HeaderSection";

export default function BuyNow() {
  const [products, setProducts] = useState([]);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const fetchProducts = async () => {
    try {
      const response = await fetch("https://bid.nyelizabeth.com/v1/api/product/filter", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.items || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <HeaderSection fetchProducts={fetchProducts} token={token} />

      {/* Product Table */}
      <ProductTable
        products={products}
        fetchProducts={fetchProducts}
        token={token}
      />
    </div>
  );
}