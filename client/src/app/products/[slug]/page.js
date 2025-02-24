"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductDetails from "./components/ProductDetails";
import MakeOfferModal from "./components/MakeOfferModal";
import config from "@/app/config_BASE_URL";
import Image from "next/image";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    console.log("ProductPage slug:", slug);

    async function fetchProduct() {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.baseURL}/v1/api/product/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();

        if (data.status && data.items) {
          const apiProduct = data.items;
          const transformedProduct = {
            name: apiProduct.title || "Product Name",
            description: apiProduct.description || "No description available.",
            price: {
              min: parseFloat(apiProduct.price) || 0,
              max: parseFloat(apiProduct.price) || 0,
            },
            location: "Beverly Hills, CA",
            images: apiProduct.image?.map((img) => img.trim()) || [],
          };
          setProduct(transformedProduct);
        } else {
          console.error("Invalid product data:", data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [slug]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        No product ID provided in the URL
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Product not found
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen mt-[120px] bg-gradient-to-b from-gray-50 to-white">
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_700px] gap-12">
            <div className="space-y-6">
              {isLoading ? (
                <div className="aspect-square rounded-xl overflow-hidden shadow-xl">
                  <div className="w-full h-full bg-gray-300 animate-pulse"></div>
                </div>
              ) : (
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name || "Product Image"}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
            </div>
            <ProductDetails
              isLoading={isLoading}
              product={product}
              productId={slug} // Pass slug as productId to ProductDetails
            />
          </div>
        </main>
      </div>
      <Footer />
      {/* Removed MakeOfferModal from here since it's now in ProductDetails */}
    </>
  );
}