"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import config from "@/app/config_BASE_URL";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const auth = useSelector((state) => state.auth);

  const fetchWishlist = async () => {
    if (!auth.token || isLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${config.baseURL}/v1/api/favorite/all`, {
        headers: {
          Authorization: `${auth.token}`,
        },
      });

      const productIds = response.data.items.map((item) => item.product._id);
      setWishlistItems(new Set(productIds));
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setIsLoaded(true); // Mark as loaded even on error to prevent retries
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (productId, productName) => {
    if (!auth.token) {
      return { success: false, message: "Please log in to add items to your wishlist." };
    }

    try {
      const response = await axios.post(
        `${config.baseURL}/v1/api/favorite/toggle`,
        { productId },
        {
          headers: {
            Authorization: `${auth.token}`,
          },
        }
      );

      const isNowFavorited = response.data.isFavorited !== undefined 
        ? response.data.isFavorited 
        : !wishlistItems.has(productId);

      // Update local state
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        if (isNowFavorited) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });

      return { 
        success: true, 
        isFavorited: isNowFavorited,
        message: isNowFavorited 
          ? `${productName} has been added to your wishlist!`
          : `${productName} has been removed from your wishlist.`
      };
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return { success: false, message: "An error occurred while updating your wishlist." };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.has(productId);
  };

  // Fetch wishlist when auth token changes
  useEffect(() => {
    if (auth.token && !isLoaded && !isLoading) {
      fetchWishlist();
    }
  }, [auth.token, isLoaded, isLoading]);

  const value = {
    wishlistItems,
    isLoading,
    isLoaded,
    toggleWishlist,
    isInWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
