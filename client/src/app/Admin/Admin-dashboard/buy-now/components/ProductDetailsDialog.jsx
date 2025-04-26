import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState, useEffect } from "react";
import config from "@/app/config_BASE_URL";

export default function ProductDetailsDialog({ productId, token, isOpen, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${config.baseURL}/v1/api/product/${productId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch product details");
        
        const data = await response.json();
        if (data.status) {
          setProduct(data.items);
        } else {
          throw new Error(data.message || "Failed to fetch product details");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProductDetails();
    }
  }, [productId, token, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                <Image
                  src={product.image?.[0] || "https://via.placeholder.com/300"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.image?.slice(1).map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`${product.title} - Image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
                <Badge variant="outline" className="mt-2">
                  {product.category?.name || "N/A"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-primary">${product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimate Price:</span>
                  <span className="font-semibold">{product.estimateprice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Offer Amount:</span>
                  <span className="font-semibold">${product.offerAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <Badge 
                    variant={product.status === "Not Sold" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {product.status || "N/A"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-semibold">{product.stock}</span>
                  </div>
                  {product.link && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Link:</span>
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Product
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Description</h3>
                <div 
                  className="text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Created At:</span>
                    <p className="font-medium">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Updated At:</span>
                    <p className="font-medium">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 