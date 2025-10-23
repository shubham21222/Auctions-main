"use client"

import { Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { useState, memo } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import { VerificationModal } from "@/app/components/VerificationModal"
import { useWishlist } from "./WishlistProvider"

// Add price formatting function
import { formatPriceWithCurrency } from "@/utils/priceFormatter";

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCardComponent = ({ image, name, price, estimatePrice, slug }) => {
  const [isHovered, setIsHovered] = useState(false) // State to track hover effect
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

  // Access the Redux state for authentication and wishlist context
  const auth = useSelector((state) => state.auth)
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Check if product is in wishlist
  const isLiked = isInWishlist(slug)

  // Function to handle toggling the wishlist
  const handleToggleWishlist = async () => {
    try {
      if (!auth.token) {
        toast.error("Please log in to add items to your wishlist.")
        return
      }

      // Check if email is verified
      if (!auth.user?.isEmailVerified) {
        setIsVerificationModalOpen(true)
        return
      }

      const result = await toggleWishlist(slug, name)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  return (
    <>
      {/* Add the Toaster component for displaying notifications */}
      {/* <Toaster position="top-right" /> */}

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
            {/* Heart Icon Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWishlist();
              }}
              className={cn(
                "p-3 rounded-full",
                "bg-white/90 backdrop-blur-sm",
                "transition-all duration-300",
                "hover:bg-white",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </motion.button>

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
              {formatPriceWithCurrency(price, false, "")}
            </span>
          </div>
        </div>
      </motion.div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        email={auth.user?.email}
      />
    </>
  )
}

// Export memoized component with stable comparison
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.slug === nextProps.slug &&
    prevProps.name === nextProps.name &&
    prevProps.price === nextProps.price &&
    prevProps.image === nextProps.image
  );
});