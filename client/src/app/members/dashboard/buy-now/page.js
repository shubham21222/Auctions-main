"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductTable from "./components/ProductTable";
import HeaderSection from "./components/HeaderSection";
import config from "@/app/config_BASE_URL";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const productsPerPage = 10;
  
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const permissions = auth?.user?.permissions || [];
  
  // Permission checks - using the actual permissions from Redux
  const canView = permissions.includes("view products");
  const canCreate = permissions.includes("create products");
  const canEdit = permissions.includes("edit products");
  const canDelete = permissions.includes("delete products"); // Note: This permission isn't in your Redux state

  const fetchProducts = async () => {
    if (!canView) return;
    
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
      
      setProducts(data.items?.items || []);
      setTotalItems(data.items?.total || 0);
      setTotalPages(data.items?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    if (token && canView) {
      fetchProducts();
    }
  }, [token, currentPage, canView]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-0 shadow-lg rounded-xl bg-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to view products.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Only show create button if user has create permission */}
      <HeaderSection 
        fetchProducts={fetchProducts} 
        token={token}
        canCreate={canCreate} 
      />

      <ProductTable
        products={products}
        fetchProducts={fetchProducts}
        token={token}
        canEdit={canEdit}
        canDelete={canDelete} // Will be false since this permission isn't in Redux
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        productsPerPage={productsPerPage}
        handlePageChange={handlePageChange}
      />
    </div>
  );
}