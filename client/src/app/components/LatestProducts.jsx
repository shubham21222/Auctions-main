'use client';
import { useEffect, useState } from "react";
import { ProductCard } from "../Buy-now/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function LatestProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLatestProducts() {
            try {
                // Fetch all products sorted by created_at descending
                const response = await fetch(
                    "http://localhost:4000/v1/api/product/filter?sortField=created_at&sortOrder=desc"
                );
                if (!response.ok) throw new Error("Failed to fetch latest products");
                const data = await response.json();

                // Take only the first 6 products
                const latestSix = (data.items || []).slice(0, 6);
                setProducts(latestSix);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLatestProducts();
    }, []);

    return (
        <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
            <div className="text-start container mx-auto mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Latest Products
                </h2>
                <div className="w-24 h-1 text-start  bg-yellow-500 mt-4  rounded-full"></div>
                {/* <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    Discover the world’s most iconic luxury brands.
                </p> */}
            </div>
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4"
                >
                    Latest Luxury Arrivals
                </motion.h2>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="space-y-4">
                                <Skeleton className="h-[300px] w-full rounded-xl" />
                                <Skeleton className="h-6 w-3/4 rounded-md" />
                                <Skeleton className="h-4 w-1/2 rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-center text-red-500">Error: {error}</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, index) => {
                            const productData = {
                                image: product.image[0],
                                name: product.title,
                                price: product.price || "Price Unavailable",
                                slug: product._id,
                            };
                            return (
                                <motion.div
                                    key={`${product._id}-${index}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <ProductCard
                                        image={productData.image}
                                        name={productData.name}
                                        price={productData.price}
                                        slug={productData.slug}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <a
                        href="/buy-now"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-primary/60 text-white rounded-full hover:shadow-lg transition-all duration-300"
                    >
                        Explore All Products
                    </a>
                </motion.div>
            </div>
        </section>
    );
}