'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditProductDialog from "./EditProductDialog";
import { useState } from "react";
import config from "@/app/config_BASE_URL";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import ProductDetailsDialog from "./ProductDetailsDialog";
import { toast } from "react-hot-toast";

export default function ProductTable({ 
  products, 
  fetchProducts, 
  token, 
  currentPage, 
  totalPages, 
  totalItems, 
  productsPerPage, 
  handlePageChange,
  selectedProducts,
  setSelectedProducts
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleBulkDelete = async (productIds) => {
    if (!confirm(`Are you sure you want to delete ${productIds.length} products?`)) {
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
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) throw new Error("Failed to delete products");
      
      toast.success("Products deleted successfully");
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error("Failed to delete products");
    } finally {
      setIsDeleting(false);
    }
  };

  // Ensure products is an array
  if (!Array.isArray(products)) {
    return <div className="text-center text-gray-500">No products available</div>;
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`${config.baseURL}/v1/api/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete product");
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProductId(null);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(product => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleRowClick = (productId) => {
    setSelectedProductId(productId);
    setDialogOpen(true);
  };

  return (
    <div className="w-full">
      {/* Bulk Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedProducts.length === products.length && products.length > 0}
            onCheckedChange={handleSelectAll}
            className="h-5 w-5"
          />
          <span className="text-sm text-gray-600">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch(`${config.baseURL}/v1/api/product/filter?limit=1000`, {
                  headers: {
                    Authorization: `${token}`,
                  },
                });
                if (!response.ok) throw new Error("Failed to fetch all products");
                const data = await response.json();
                const allProductIds = data.items.items.map(product => product._id);
                setSelectedProducts(allProductIds);
                toast.success(`Selected ${allProductIds.length} products`);
              } catch (error) {
                console.error("Error fetching all products:", error);
                toast.error("Failed to select all products");
              }
            }}
            className="text-primary hover:text-primary/80"
          >
            Select All Products
          </Button>
          {selectedProducts.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => handleBulkDelete(selectedProducts)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '50px' }}>Select</TableHead>
                  <TableHead style={{ width: '500px' }}>Product</TableHead>
                  <TableHead style={{ width: '200px' }}>Category</TableHead>
                  <TableHead style={{ width: '150px' }}>Status</TableHead>
                  <TableHead style={{ width: '150px' }} className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center justify-center min-h-[200px]">
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow 
                      key={product._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(product._id)}
                    >
                      <TableCell style={{ width: '50px' }} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onCheckedChange={(checked) => handleSelectProduct(product._id, checked)}
                        />
                      </TableCell>
                      <TableCell style={{ width: '500px' }}>
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell style={{ width: '200px' }}>
                        <Badge variant="outline" className="whitespace-nowrap">{product.category?.name || "N/A"}</Badge>
                      </TableCell>
                      <TableCell style={{ width: '150px' }}>
                        <Badge 
                          variant={product.status === "Not Sold" ? "default" : "secondary"}
                          className="capitalize whitespace-nowrap"
                        >
                          {product.status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: '150px' }} className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100"
                            onClick={() => window.open(`/products/${product._id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <EditProductDialog
                              product={product}
                              fetchProducts={fetchProducts}
                              token={token}
                              onClose={handleCloseDialog}
                            />
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-50 text-red-500"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        productId={selectedProductId}
        token={token}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2 flex-wrap gap-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/60 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              variant={currentPage === page ? "default" : "outline"}
              className={`px-4 py-2 rounded-full ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "border-primary/20 text-primary hover:bg-primary/10"
              }`}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/60 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}