"use client"

import { Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios" // Import Axios for API calls
import toast, { Toaster } from "react-hot-toast" // Import React Hot Toast
import { useSelector } from "react-redux" // Import useSelector to access Redux state
import config from "@/app/config_BASE_URL"
import { VerificationModal } from "@/app/components/VerificationModal"

export function ProductCard({ image, name, price, estimatePrice, slug }) {
  const [isLiked, setIsLiked] = useState(false) // State to track if the product is liked
  const [isHovered, setIsHovered] = useState(false) // State to track hover effect
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

  // Access the Redux state for authentication
  const auth = useSelector((state) => state.auth)

  // Function to fetch the user's wishlist and check if the product is already in it
  const fetchWishlist = async () => {
    try {
      // Ensure the user is authenticated (token exists)
      if (!auth.token) {
        console.error("User is not authenticated")
        return
      }

      // Make the API call to fetch the wishlist
      const response = await axios.get(`${config.baseURL}/v1/api/favorite/all`, {
        headers: {
          Authorization: `${auth.token}`, // Include the token in the headers
        },
      })

      // Extract the list of product IDs from the response
      const wishlistProducts = response.data.items.map((item) => item.product._id)

      // Check if the current product (slug) is in the wishlist
      setIsLiked(wishlistProducts.includes(slug))
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      // toast.error("An error occurred while fetching your wishlist.")
    }
  }

  // Function to handle toggling the wishlist
  const toggleWishlist = async () => {
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

      const response = await axios.post(
        `${config.baseURL}/v1/api/favorite/toggle`,
        { productId: slug },
        {
          headers: {
            Authorization: `${auth.token}`,
          },
        }
      )

      console.log("API Response:", response.data)

      let isNowFavorited
      if (response.data.isFavorited !== undefined) {
        isNowFavorited = response.data.isFavorited
      } else {
        isNowFavorited = !isLiked
      }

      setIsLiked(isNowFavorited)

      if (isNowFavorited) {
        toast.success(`${name} has been added to your wishlist!`)
      } else {
        toast.success(`${name} has been removed from your wishlist.`)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  // Fetch the wishlist when the component mounts
  useEffect(() => {
    fetchWishlist()
  }, []) // Empty dependency array ensures this runs only once on mount

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
                toggleWishlist();
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
              {price}
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