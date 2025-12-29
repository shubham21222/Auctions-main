"use client"

import { Share2 } from "lucide-react"
import Image from "next/image"
import { useState, memo } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { formatPriceWithCurrency } from "@/utils/priceFormatter"

// General ProductCard component without wishlist functionality
const GeneralProductCardComponent = ({ image, name, price, estimatePrice, slug }) => {
  const [isHovered, setIsHovered] = useState(false) // State to track hover effect

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          className={cn("object-cover transition-transform duration-700 ease-out", isHovered && "scale-110")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Share Icon Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-full py-3 bg-white/90 backdrop-blur-sm rounded-xl font-semibold hover:bg-white transition-all duration-300"
              >
                View Details
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 space-y-3">
        <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-luxury-gold">
            {formatPriceWithCurrency(price, false)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Export memoized component with stable comparison
export const GeneralProductCard = memo(GeneralProductCardComponent, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.slug === nextProps.slug &&
    prevProps.name === nextProps.name &&
    prevProps.price === nextProps.price &&
    prevProps.image === nextProps.image
  );
});
