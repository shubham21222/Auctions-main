'use client'
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductImageGallery({ isLoading, product }) {
    const [currentImage, setCurrentImage] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const carouselRef = useRef(null);

    // Ensure product.images exists and is an array
    const images = product?.images || [];
    const totalImages = images.length;

    const nextImage = useCallback(() => {
        if (totalImages === 0) return;
        setCurrentImage((prev) => (prev + 1) % totalImages);
    }, [totalImages]);

    const prevImage = useCallback(() => {
        if (totalImages === 0) return;
        setCurrentImage((prev) => (prev - 1 + totalImages) % totalImages);
    }, [totalImages]);

    // Touch handling
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            prevImage();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [prevImage, nextImage, isFullscreen]);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || isHovered || isLoading || totalImages <= 1) return;

        const interval = setInterval(nextImage, 3000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, isHovered, isLoading, totalImages, nextImage]);

    // Reset current image when product changes
    useEffect(() => {
        setCurrentImage(0);
    }, [product?.images]);

    // Fullscreen handling
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFullscreen]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Skeleton className="w-full h-full" />
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!totalImages) {
        return (
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
            </div>
        );
    }

    const carouselContent = (
        <>
            {/* Main Image with Transition */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                >
                    <Image
                        src={images[currentImage]}
                        alt={`${product?.name || 'Product'} - Image ${currentImage + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                        priority={currentImage === 0}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            {totalImages > 1 && (
                <>
                    {/* Previous Button */}
                    <motion.button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={totalImages <= 1}
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </motion.button>

                    {/* Next Button */}
                    <motion.button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={totalImages <= 1}
                    >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                    </motion.button>

                    {/* Play/Pause Button */}
                    {/* <motion.button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all duration-200 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isAutoPlaying ? (
                            <Pause className="w-5 h-5 text-gray-800" />
                        ) : (
                            <Play className="w-5 h-5 text-gray-800" />
                        )}
                    </motion.button> */}

                    {/* Fullscreen Button */}
                    {/* <motion.button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="absolute top-4 right-16 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all duration-200 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isFullscreen ? (
                            <X className="w-5 h-5 text-gray-800" />
                        ) : (
                            <Maximize2 className="w-5 h-5 text-gray-800" />
                        )}
                    </motion.button> */}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm z-10">
                        {currentImage + 1} / {totalImages}
                    </div>
                </>
            )}
        </>
    );

    return (
        <div className="space-y-4">
            {/* Main Carousel */}
            <div 
                ref={carouselRef}
                className={`relative aspect-square rounded-xl overflow-hidden bg-white shadow-lg transition-all duration-300 ${
                    isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {carouselContent}
            </div>

            {/* Thumbnails */}
            {totalImages > 1 && !isFullscreen && (
                <div className="grid grid-cols-6 gap-2">
                    {images.map((image, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentImage(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                currentImage === index
                                    ? "border-blue-600 shadow-md"
                                    : "border-gray-200 hover:border-blue-400"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                sizes="100px"
                                className="object-cover"
                            />
                            {currentImage === index && (
                                <motion.div
                                    className="absolute inset-0 bg-blue-600/20"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Fullscreen Overlay */}
            {isFullscreen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 z-40"
                    onClick={() => setIsFullscreen(false)}
                />
            )}
        </div>
    );
}