'use client'
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import Link from "next/link";
import MakeOfferModal from "./MakeOfferModal";
import { useState } from "react";

export default function ProductDetails({ isLoading, product }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    console.log('====================================');
    console.log(product);
    console.log('====================================');
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                {isLoading ? (
                    <Skeleton className="w-64 h-8" />
                ) : (
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900"
                    >
                        {product.name}
                    </motion.h1>
                )}
                {isLoading ? (
                    <Skeleton className="w-10 h-10 rounded-full" />
                ) : (
                    <motion.button
                        className="p-2 hover:text-red-500 transition-all duration-300 rounded-full hover:bg-red-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart className="w-5 h-5" />
                    </motion.button>
                )}
            </div>

            {isLoading ? (
                <Skeleton className="w-full h-20" />
            ) : (
                <p className="text-gray-600 text-base leading-relaxed">{product.description}</p>
            )}

            <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                {isLoading ? (
                    <Skeleton className="w-24 h-4" />
                ) : (
                    <p className="text-sm text-gray-500">Estimate Price</p>
                )}
                {isLoading ? (
                    <Skeleton className="w-48 h-8" />
                ) : (
                    <p className="text-2xl font-bold text-gray-900">
                        ${product.price.min.toLocaleString()} - $
                        {product.price.max.toLocaleString()}
                    </p>
                )}
            </div>

            {isLoading ? (
                <Skeleton className="w-full h-16 rounded-xl" />
            ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 text-base py-4 rounded-xl shadow-lg hover:shadow-xl"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Make an Offer
                    </Button>
                </motion.div>
            )}

            <div className="space-y-6 bg-gray-50 p-4 rounded-xl">
                <div>
                    {isLoading ? (
                        <Skeleton className="w-32 h-6" />
                    ) : (
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                            Shipping Details
                        </h3>
                    )}
                    {isLoading ? (
                        <Skeleton className="w-48 h-4" />
                    ) : (
                        <p className="text-gray-600">Item located in : {product.location}</p>
                    )}
                </div>

                <div>
                    {isLoading ? (
                        <Skeleton className="w-24 h-6" />
                    ) : (
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">Payment</h3>
                    )}
                    {isLoading ? (
                        <Skeleton className="w-32 h-4" />
                    ) : (
                        <Link
                            href="#"
                            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                            View Policy for Payment
                        </Link>
                    )}
                </div>
            </div>
            <MakeOfferModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                minPrice={product?.price?.min ?? 0}
                product = {product} />
        </div>
    );
}