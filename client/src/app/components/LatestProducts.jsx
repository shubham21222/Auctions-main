'use client';
import { useEffect, useState } from "react";
import { ProductCard } from "../Buy-now/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import config from "@/app/config_BASE_URL";

export default function LatestProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLatestProducts() {
            try {
                // Fetch the latest 6 products directly from the API
                const response = await fetch(
                    `${config.baseURL}/v1/api/product/filter?sortField=created_at&sortOrder=desc&limit=60`
                );
                if (!response.ok) throw new Error("Failed to fetch latest products");
                const data = await response.json();

                // Extract products from the nested items.items structure
                const latestProducts = data.items?.items || [];
                setProducts(latestProducts);
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
                <div className="w-24 h-1 text-start bg-yellow-500 mt-4 rounded-full"></div>
            </div>
            <div className="container mx-auto px-6">
                {/* <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-center text-gray-800 mb-6"
                >
                    Latest Luxury Arrivals
                </motion.h2> */}

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
                        {products.length > 0 ? (
                            products.map((product, index) => {
                                const productData = {
                                    image: product.image[0],
                                    name: product.title,
                                    price: product.estimateprice || "Price Unavailable",
                                    slug: product._id,
                                };
                                return (
                                    <motion.div
                                        key={`${product._id}-${index}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="cursor-pointer"
                                        onClick={() => window.location.href = `/products/${product._id}`}
                                    >
                                        <ProductCard
                                            image={productData.image}
                                            name={productData.name}
                                            price={productData.price}
                                            slug={productData.slug}
                                        />
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500">No products available</p>
                        )}
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
                        href="/Buy-now"
                        className="inline-block px-8 py-3 bg-blue-900 text-white rounded-full hover:shadow-lg transition-all duration-300"
                    >
                        Explore All Products
                    </a>
                </motion.div>
            </div>
        </section>
    );
}