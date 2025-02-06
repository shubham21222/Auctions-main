'use client'
import Image from "next/image";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton instead of SkeletonImage
import { useState } from "react";
import { ZoomIn } from "lucide-react";

export default function ProductImageGallery({ isLoading, product }) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div className="space-y-6">
            <motion.div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
                {isLoading ? (
                    <Skeleton className="aspect-square rounded-xl" /> // Use Skeleton here
                ) : (
                    <>
                        <Image
                            src={product.images[selectedImage] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110">
                            <ZoomIn className="w-4 h-4 text-gray-800" />
                        </button>
                    </>
                )}
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="aspect-square rounded-lg" /> // Use Skeleton here
                      ))
                    : product.images.map((image, i) => (
                          <motion.div
                              key={i}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                                  selectedImage === i
                                      ? "border-blue-600 shadow-lg"
                                      : "border-gray-200 hover:border-blue-400"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedImage(i)}
                          >
                              <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`${product.name} view ${i + 1}`}
                                  fill
                                  className="object-cover transition-transform duration-300"
                              />
                          </motion.div>
                      ))}
            </div>
        </div>
    );
}