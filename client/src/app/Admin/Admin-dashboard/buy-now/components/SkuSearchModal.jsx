import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import { useSelector } from "react-redux";

export default function SkuSearchModal({ isOpen, onClose, onProductFound }) {
  const [sku, setSku] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const handleSearch = async () => {
    if (!sku.trim()) {
      toast.error("Please enter a SKU number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/product/filter?sku=${sku}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();
      if (data.status && data.items?.items?.length > 0) {
        setFoundProduct(data.items.items[0]);
        toast.success("Product found!");
      } else {
        setFoundProduct(null);
        toast.error("Product not found");
      }
    } catch (error) {
      console.error("Error searching product:", error);
      toast.error("Failed to search product");
      setFoundProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = () => {
    if (foundProduct) {
      onProductFound([foundProduct]);
      onClose();
    }
  };

  const handleViewProduct = () => {
    if (foundProduct) {
      window.open(`/products/${foundProduct._id}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Product by SKU</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter SKU number"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {foundProduct && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{foundProduct.title}</h3>
                  <p className="text-sm text-gray-600">SKU: {foundProduct.sku}</p>
                  <p className="text-sm text-gray-600">Category: {foundProduct.category?.name}</p>
                  <p className="text-sm text-gray-600">Status: {foundProduct.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price: ${foundProduct.price}</p>
                  <p className="text-sm text-gray-600">Estimate: {foundProduct.estimateprice}</p>
                  <p className="text-sm text-gray-600">Offer Amount: ${foundProduct.offerAmount}</p>
                </div>
              </div>
              {foundProduct.image && foundProduct.image.length > 0 && (
                <div className="mt-4">
                  <img 
                    src={foundProduct.image[0]} 
                    alt={foundProduct.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={handleViewProduct}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Product
                </Button>
                <Button
                  onClick={handleSelectProduct}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Select Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 