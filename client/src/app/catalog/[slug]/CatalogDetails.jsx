"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";
import BillingDetailsModal from "./BillingDetailsModal";
import PaymentMethodModal from "./PaymentMethodModal ";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const getBidIncrement = (currentBid) => {
  if (currentBid >= 1000000) return 50000;
  if (currentBid >= 500000) return 25000;
  if (currentBid >= 250000) return 10000;
  if (currentBid >= 100000) return 5000;
  if (currentBid >= 50000) return 2500;
  if (currentBid >= 25025) return 1000;
  if (currentBid >= 10000) return 500;
  if (currentBid >= 5000) return 250;
  if (currentBid >= 1000) return 100;
  if (currentBid >= 100) return 50;
  if (currentBid >= 50) return 10;
  if (currentBid >= 25) return 5;
  return 1;
};

const renderHTML = (htmlString) => {
  if (!htmlString) return "No description available.";
  return htmlString.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
};

export default function CatalogDetails({
  product,
  auction,
  loading,
  onBidNowClick,
  token,
  notifications,
  socket,
  messages,
  isJoined,
  setIsJoined,
  userId,
}) {
  const [userCache, setUserCache] = useState({});
  const [bidsWithUsernames, setBidsWithUsernames] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [clerkMessages, setClerkMessages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [hasBillingDetails, setHasBillingDetails] = useState(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const isClerk = useSelector((state) => state.auth.isClerk);

  const fetchUserName = useCallback(
    async (id) => {
      if (!token || !id) return 'Anonymous';
      if (userCache[id]) return userCache[id];

      try {
        const response = await fetch(`${config.baseURL}/v1/api/auth/getUserById/${id}`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        const userName = data.items?.name || 'Anonymous';
        setUserCache((prev) => ({ ...prev, [id]: userName }));
        return userName;
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error.message);
        return 'Anonymous';
      }
    },
    [token, userCache]
  );

  const checkUserDetails = useCallback(async () => {
    if (!userId || !token) {
      setHasBillingDetails(false);
      setHasPaymentMethod(false);
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auth/getUserById/${userId}`, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      const data = await response.json();

      if (response.ok && data.status) {
        const hasBilling = Array.isArray(data.items?.BillingDetails) && data.items.BillingDetails.length > 0;
        const hasPayment = data.items?.paymentMethodId !== null && data.items?.paymentMethodId !== undefined;

        setHasBillingDetails(hasBilling);
        setHasPaymentMethod(hasPayment);
      } else {
        setHasBillingDetails(false);
        setHasPaymentMethod(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setHasBillingDetails(false);
      setHasPaymentMethod(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId) checkUserDetails();
  }, [userId, checkUserDetails]);

  useEffect(() => {
    if (hasBillingDetails === false && isJoined) {
      setIsBillingModalOpen(true);
    } else if (hasBillingDetails === true && hasPaymentMethod === false && isJoined) {
      setIsPaymentModalOpen(true);
    }
  }, [hasBillingDetails, hasPaymentMethod, isJoined]);

  useEffect(() => {
    if (!auction?.bids) {
      setBidsWithUsernames([]);
      return;
    }

    const updateBidsWithUsernames = async () => {
      const updatedBids = await Promise.all(
        auction.bids.map(async (bid) => {
          const bidderName = await fetchUserName(bid.bidder);
          return {
            ...bid,
            bidderName: typeof bidderName === 'object' ? bidderName.name : bidderName,
            isClerk: bid.bidder?.isClerk || false
          };
        })
      );
      setBidsWithUsernames(updatedBids);
    };

    updateBidsWithUsernames();
  }, [auction?.bids, fetchUserName]);

  useEffect(() => {
    if (messages && Array.isArray(messages)) {
      const formattedMessages = messages.map((msg) => ({
        message: typeof msg.message === "string" ? msg.message : msg.actionType || "Update",
        bidTime: msg.timestamp || new Date(),
        sender: typeof msg.sender === "string" ? msg.sender : msg.sender?.name || "Admin",
        type: "message",
        isClerk: msg.sender?.isClerk || false,
      }));

      // Separate admin and clerk messages
      const adminMsgs = formattedMessages.filter(msg => !msg.isClerk);
      const clerkMsgs = formattedMessages.filter(msg => msg.isClerk);

      setAdminMessages(adminMsgs);
      setClerkMessages(clerkMsgs);
    } else {
      setAdminMessages([]);
      setClerkMessages([]);
    }
  }, [messages]);

  const handleJoinAuction = async () => {
    if (!userId) {
      toast.error("Please log in to join the auction");
      return;
    }
    if (!auction || !auction._id) {
      toast.error("No active auction available");
      return;
    }
    if (!termsAccepted) {
      toast.error("You must accept the terms and conditions to join the auction.");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ auctionId: auction._id, userId: userId }),
      });

      const data = await response.json();
      if (!response.ok && data.message !== "User already joined the auction") {
        throw new Error(data.message || "Failed to join auction");
      }

      setIsJoined(true);
      toast.success("Successfully joined the auction!");
      
      if (socket && socket.connected) {
        socket.emit("joinAuction", { auctionId: auction._id, userId });
      socket.emit("getAuctionData", { auctionId: auction._id });
      }
    } catch (error) {
      console.error("Join Auction Error:", error);
      toast.error(error.message || "Failed to join auction.");
    }
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    const currentBid = auction?.currentBid || 0;
    const bidIncrement = getBidIncrement(currentBid);
    const nextBid = currentBid + bidIncrement;
    onBidNowClick(nextBid);
  };

  const handleBillingUpdate = (normalizedDetails) => {
    setIsBillingModalOpen(false);
    setHasBillingDetails(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setHasPaymentMethod(true);
    toast.success("Payment method added successfully!");
  };

  const handleImageError = (index) => {
    if (!imageErrors[index]) {
      console.log(`Image ${index} failed to load, marking as errored`);
      setImageErrors((prev) => ({ ...prev, [index]: true }));
    }
  };

  const handleImageLoad = (index) => {
    if (!loadedImages[index]) {
      console.log(`Image ${index} loaded successfully`);
      setLoadedImages((prev) => ({ ...prev, [index]: true }));
    }
  };

  const combinedHistory = [
    ...bidsWithUsernames.map((bid) => ({
      type: "bid",
      bidderName: bid.bidderName,
      bidAmount: bid.bidAmount,
      bidTime: bid.bidTime,
      bidType: bid.bidType,
    })),
    ...adminMessages.map((msg) => ({
      type: "message",
      message: msg.message,
      bidTime: msg.bidTime,
      sender: msg.sender,
    })),
  ].sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime)); // Sort descending

  const productImages = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [];

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Main Content - Left Side */}
      <div className="flex-1 flex flex-col">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col gap-8 pb-6">
              {/* Product Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden">
                {productImages.length > 0 ? (
                  imageErrors[selectedImageIndex] ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                      <div className="text-center">
                        <p>Image not available</p>
                        <p className="text-xs mt-2">Please try another image</p>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={`${product?.name || "Product"} main image`}
                      fill
                      className="object-contain"
                      priority={selectedImageIndex === 0}
                      onError={() => handleImageError(selectedImageIndex)}
                      onLoad={() => handleImageLoad(selectedImageIndex)}
                      unoptimized={true}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                    No images available
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => !imageErrors[index] && setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? "border-gray-900" : "border-gray-200"
                      } ${imageErrors[index] ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {imageErrors[index] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <span className="text-xs text-gray-500">Error</span>
                        </div>
                      ) : (
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(index)}
                          onLoad={() => handleImageLoad(index)}
                          unoptimized={true}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-6 px-2">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-wrap">{renderHTML(product?.description)}</p>
                  </div>
                </div>

                {/* Additional Details if any */}
                {product?.details && (
                  <div className="space-y-4 border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-600 whitespace-pre-wrap">{renderHTML(product?.details)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bid Section */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Bid</span>
                <span className="text-3xl font-bold text-gray-900">
                  ${(auction?.currentBid || 0).toLocaleString()}
                </span>
              </div>
              {/* <div className="mt-2 text-sm text-gray-500 flex justify-between">
                <span>Est. ${auction?.estimatedValue?.min?.toLocaleString()} - ${auction?.estimatedValue?.max?.toLocaleString()}</span>
                <span>{auction?.bids?.length || 0} bids</span>
              </div> */}
                </div>
                
            {auction && auction.status === "ACTIVE" && (
              <div className="space-y-3">
                {!isJoined ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the terms and conditions of this auction
                      </label>
                    </div>
                    <button
                      onClick={handleJoinAuction}
                      disabled={!termsAccepted}
                      className={`w-full py-3 px-4 rounded-lg ${
                        termsAccepted 
                          ? 'bg-gray-900 text-white hover:bg-gray-800' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } transition-colors`}
                    >
                      Join Auction to Bid
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBidSubmit}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Place Bid: ${((auction.currentBid || 0) + getBidIncrement(auction.currentBid || 0)).toLocaleString()}
                  </button>
                )}
                  </div>
                )}
              </div>
            </div>
        </div>

      {/* Bid History Panel - Right Side */}
      <div className="w-[350px] bg-white rounded-lg shadow-sm p-6">
        <div className="h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Bid History</h2>
          
          {/* Live Status */}
          {auction?.status === "ACTIVE" && (
            <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Auction
                </div>
              )}

          {/* Bid List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {auction?.bids?.map((bid, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${
                          bid.bidder === userId 
                      ? 'bg-gray-50 border border-gray-200' 
                      : 'bg-white border border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-900">
                            ${bid.bidAmount.toLocaleString()}
                          </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {bid.bidderName || 'Anonymous'}
                        </p>
                      </div>
                    <span className="text-xs text-gray-400">
                      {new Date(bid.bidTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {(!auction?.bids || auction.bids.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  No bids yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BillingDetailsModal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
        onBillingUpdate={handleBillingUpdate} 
      />
      <PaymentMethodModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={handlePaymentSuccess}
        token={token} 
      />
    </div>
  );
}