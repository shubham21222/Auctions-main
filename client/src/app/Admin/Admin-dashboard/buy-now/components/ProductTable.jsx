'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditProductDialog from "./EditProductDialog";
import { useState } from "react";
import config from "@/app/config_BASE_URL";

export default function ProductTable({ products, fetchProducts, token }) {
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
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false); // State to manage dialog visibility

  const handleCloseDialog = () => {
    setDialogOpen(false); // Close the dialog
    setSelectedProduct(null); // Reset the selected product
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">No products found</div>
      ) : (
        products.map((product) => (
          <Card key={product._id} className="shadow-md hover:shadow-lg transition-shadow">
            {/* Image */}
            <CardContent className="p-0">
              <img
                src={product.image?.[0] || "https://via.placeholder.com/300"} // Fallback image
                alt={product.title}
                className="w-full h-48 object-cover rounded-t-md"
              />
            </CardContent>

            {/* Content */}
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

            {/* Actions */}
            <CardFooter className="flex justify-between">
              {/* Edit Button */}
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
                  onClose={handleCloseDialog} // Pass onClose to close the dialog

                />
              </Dialog>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => handleDelete(product._id)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}