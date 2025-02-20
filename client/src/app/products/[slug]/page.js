"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductDetails from "./components/ProductDetails"; // Import the ProductDetails component

export default function ProductPage() {
    const { slug } = useParams(); // Extract slug (product ID) from URL
    const [product, setProduct] = useState(null); // Store the fetched product
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:4000/v1/api/product/${slug}`); // Fetch product by ID
                if (!response.ok) {
                    throw new Error("Failed to fetch product");
                }
                const data = await response.json();

                // Check if the API returned a valid product
                if (data.status && data.items) {
                    const apiProduct = data.items;

                    // Transform the product data to match the expected structure
                    const transformedProduct = {
                        name: apiProduct.title || "Product Name",
                        description: apiProduct.description || "No description available.",
                        price: {
                            min: parseFloat(apiProduct.price) || 0,
                            max: parseFloat(apiProduct.price) || 0,
                        },
                        location: "Beverly Hills, CA", // Default location
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
        }
    }, [slug]);

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
                {/* Main Product Section */}
                <main className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_700px] gap-12">
                        {/* Image Gallery */}
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="aspect-square rounded-xl overflow-hidden shadow-xl">
                                    <div className="w-full h-full bg-gray-300 animate-pulse"></div>
                                </div>
                            ) : (
                                <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
                                    <img
                                        src={product.images[0] || "/placeholder.svg"}
                                        alt={product.name || "Product Image"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <ProductDetails isLoading={isLoading} product={product} />
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}