'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditProductDialog from "./EditProductDialog";
import { useState } from "react";
import config from "@/app/config_BASE_URL";
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
  canEdit,
  canDelete
}) {
  // Ensure products is an array
  if (!Array.isArray(products)) {
    return <div className="text-center text-gray-500">No products available</div>;
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${config.baseURL}/v1/api/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to delete product");
      
      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Generate pagination items with truncation
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      items.push(1);
      if (leftBound > 2) items.push("...");
      for (let i = leftBound; i <= rightBound; i++) {
        items.push(i);
      }
      if (rightBound < totalPages - 1) items.push("...");
      items.push(totalPages);
    }

    return items;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No products found</div>
        ) : (
          products.map((product) => (
            <Card key={product._id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  src={product.image?.[0] || "https://via.placeholder.com/300"}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-t-md"
                />
              </CardContent>

              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">${product.price}</span>
                  <Badge variant="outline">{product.category?.name || "N/A"}</Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status: {product.status || "N/A"}</span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                {canEdit && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <EditProductDialog
                      product={product}
                      fetchProducts={fetchProducts}
                      token={token}
                      onClose={handleCloseDialog}
                    />
                  </Dialog>
                )}

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </Button>
                )}

                {!canEdit && !canDelete && (
                  <span className="text-sm text-gray-500">No actions available</span>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

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

          {getPaginationItems().map((item, index) => (
            <Button
              key={index}
              onClick={() => typeof item === "number" && handlePageChange(item)}
              disabled={item === "..."}
              className={`px-4 py-2 rounded-full ${
                currentPage === item
                  ? "bg-blue-800 text-white"
                  : item === "..."
                  ? "bg-transparent text-gray-500 cursor-default"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-all`}
            >
              {item}
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