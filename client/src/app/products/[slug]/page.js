"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductDetails from "./components/ProductDetails"; // Import the ProductDetails component

export default function ProductPage() {
    const { slug } = useParams(); // Extract slug from URL (e.g., 214047)
    const [products, setProducts] = useState([]); // Store all products fetched from API
    const [product, setProduct] = useState(null); // Store the matched product
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/products`); // Fetch all products
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                const data = await response.json();

                // Clean up keys to remove BOM (\ufeff)
                const cleanedProducts = data.products.map((product) => {
                    const cleanedProduct = {};
                    for (const key in product) {
                        const cleanKey = key.replace("\ufeff", ""); // Remove BOM
                        cleanedProduct[cleanKey] = product[key];
                    }
                    return cleanedProduct;
                });

                setProducts(cleanedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, []);

    useEffect(() => {
        if (products.length > 0 && slug) {
            const matchedProduct = products.find(
                (p) => p.ID == slug // Use the cleaned "ID" field
            );

            // Transform the product data to match the expected structure
            if (matchedProduct) {
                const transformedProduct = {
                    name: matchedProduct.Name || "Product Name",
                    description: matchedProduct.Description || "No description available.",
                    price: {
                        min: parseFloat(matchedProduct["Regular price"]) || 0,
                        max: parseFloat(matchedProduct["Regular price"]) || 0,
                    },
                    location: "Beverly Hills, CA", // Default location from the API description
                    images: matchedProduct.Images?.split(",").map((img) => img.trim()) || [],
                };
                setProduct(transformedProduct);
            }
        }
    }, [products, slug]);

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