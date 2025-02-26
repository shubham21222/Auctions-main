"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductDetails from "./components/ProductDetails";
import config from "@/app/config_BASE_URL";
import Image from "next/image";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Track selected image

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
            images: apiProduct.image?.map((img) => img.trim()) || [], // Handle multiple images
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

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

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
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-xl">
                    <div className="w-full h-full bg-gray-300 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="w-20 h-20 bg-gray-300 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
                    <Image
                      src={product.images[selectedImageIndex] || "/placeholder.svg"}
                      alt={product.name || "Product Image"}
                      layout="fill"
                      objectFit="cover"
                      className="transition-all duration-300"
                    />
                  </div>
                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageClick(index)}
                          className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index ? "border-blue-600" : "border-gray-200"
                          }`}
                        >
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="hover:opacity-75 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ProductDetails
              isLoading={isLoading}
              product={product}
              productId={slug}
            />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}