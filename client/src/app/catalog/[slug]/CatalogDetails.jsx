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
import PaymentMethodModal from "./PaymentMethodModal";
import { motion } from "framer-motion";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [hasBillingDetails, setHasBillingDetails] = useState(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const fetchUserName = useCallback(
    async (id) => {
      if (!token || !id) return id;
      if (userCache[id]) return userCache[id];

      try {
        const response = await fetch(`${config.baseURL}/v1/api/auth/getUserById/${id}`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        const userName = data.items?.name || id;
        setUserCache((prev) => ({ ...prev, [id]: userName }));
        return userName;
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error.message);
        return id;
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
        auction.bids.map(async (bid) => ({
          ...bid,
          bidderName: await fetchUserName(bid.bidder),
        }))
      );
      setBidsWithUsernames(updatedBids);
    };

    updateBidsWithUsernames();
  }, [auction?.bids, fetchUserName]);

  useEffect(() => {
    if (messages && Array.isArray(messages)) {
      const formattedMessages = messages.map((msg) => ({
        message: typeof msg.message === "string" ? msg.message : (msg.actionType || "Update"),
        bidTime: msg.timestamp || new Date(),
        sender: typeof msg.sender === "string" ? msg.sender : (msg.sender?.name || "Admin"),
        type: "message",
      }));
      setAdminMessages(formattedMessages);
    } else {
      setAdminMessages([]);
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

    if (hasBillingDetails === null || hasPaymentMethod === null) {
      toast.error("Checking account details, please wait...");
      return;
    }

    if (!hasBillingDetails) {
      setIsBillingModalOpen(true);
      toast.error("Please provide your billing details to join the auction.");
      return;
    }

    if (!hasPaymentMethod) {
      setIsPaymentModalOpen(true);
      toast.error("Please add a payment method to join the auction.");
      return;
    }

    try {
      if (!socket || !socket.connected) {
        toast.error("Connection to auction server lost. Please refresh the page.");
        return;
      }

      socket.emit("joinAuction", { auctionId: auction._id, userId });

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
      socket.emit("getAuctionData", { auctionId: auction._id });
    } catch (error) {
      console.error("Join Auction Error:", error);
      toast.error(error.message || "Failed to join auction.");
    }
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();

    if (hasBillingDetails === null || hasPaymentMethod === null) {
      toast.error("Checking account details, please wait...");
      return;
    }

    if (!hasBillingDetails) {
      setIsBillingModalOpen(true);
      toast.error("Please provide your billing details to place a bid.");
      return;
    }

    if (!hasPaymentMethod) {
      setIsPaymentModalOpen(true);
      toast.error("Please add a payment method to place a bid.");
      return;
    }

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
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const combinedHistory = [
    ...bidsWithUsernames.map((bid) => ({
      type: "bid",
      bidderName: bid.bidderName,
      bidAmount: bid.bidAmount,
      bidTime: bid.bidTime,
    })),
    ...adminMessages.map((msg) => ({
      type: "message",
      message: msg.message,
      bidTime: msg.bidTime,
      sender: msg.sender,
    })),
  ].sort((a, b) => new Date(a.bidTime) - new Date(b.bidTime));

  const productImages = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="group relative bg-white rounded-lg shadow-md overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative aspect-square bg-gray-200 animate-shimmer" />
            <div className="p-4 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
            </div>
          </motion.div>
        </div>
      ) : product ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div initial={{ x: -50 }} animate={{ x: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-28 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible">
                {productImages.length > 0 ? (
                  productImages.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                        selectedImageIndex === index ? "border-luxury-gold" : "border-gray-200"
                      }`}
                    >
                      {imageErrors[index] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center p-2">
                          Image not available
                        </div>
                      ) : (
                        <Image
                          src={image}
                          alt={`${product.name || "Product"} image ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(index)}
                          priority={index === 0}
                        />
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-lg shadow-md bg-gray-100 flex items-center justify-center text-gray-500 text-sm text-center">
                    No images available
                  </div>
                )}
              </div>
              <div className="flex-1">
                {productImages.length > 0 ? (
                  <motion.div whileHover={{ scale: 1.02 }} className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg border border-luxury-gold/20">
                    {imageErrors[selectedImageIndex] ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-lg">Image not available</div>
                    ) : (
                      <>
                        <Image
                          src={productImages[selectedImageIndex]}
                          alt={`${product.name || "Product"} main image`}
                          fill
                          className="object-cover"
                          priority
                          onError={() => handleImageError(selectedImageIndex)}
                        />
                        <div className="absolute bottom-4 right-4 bg-luxury-gold/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {selectedImageIndex + 1} / {productImages.length}
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <div className="relative aspect-[4/3] rounded-xl shadow-lg border border-luxury-gold/20 bg-gray-100 flex items-center justify-center text-gray-500 text-lg">No images available</div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 50 }} animate={{ x: 0 }} className="space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-luxury-gold/10">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-luxury-gold" /> Product Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{renderHTML(product.description)}</p>
            </div>

            {auction && (
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-luxury-gold/10">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-luxury-gold" /> Place Your Bid
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Bid</span>
                    <span className="text-2xl font-bold text-luxury-gold">${(typeof auction.currentBid === "number" ? auction.currentBid : 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Bid</span>
                    <span className="text-lg font-semibold text-gray-900">${(typeof auction.currentBid === "number" ? auction.currentBid + getBidIncrement(auction.currentBid || 0) : 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bid Increment</span>
                    <span className="text-lg font-semibold text-gray-900">${getBidIncrement(typeof auction.currentBid === "number" ? auction.currentBid : 0).toLocaleString()}</span>
                  </div>
                  {!isJoined ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="h-5 w-5 text-luxury-gold border-gray-300 rounded focus:ring-luxury-gold"
                        />
                        <label htmlFor="terms" className="text-gray-600 text-sm">
                          I agree to the <Link href="/terms" className="text-luxury-gold hover:underline">Terms and Conditions</Link>
                        </label>
                      </div>
                      <Button
                        onClick={handleJoinAuction}
                        className="w-full bg-luxury-gold text-white hover:bg-luxury-gold/90 transition-all duration-300"
                        disabled={!termsAccepted || hasBillingDetails === null || hasPaymentMethod === null}
                      >
                        Join Auction
                      </Button>
                    </div>
                  ) : auction.status !== "ENDED" ? (
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      <div className="text-center text-gray-600">
                        Click to place a bid of <span className="font-semibold text-luxury-gold">${(typeof auction.currentBid === "number" ? auction.currentBid + getBidIncrement(auction.currentBid || 0) : 0).toLocaleString()}</span>
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300" disabled={auction.status === "ENDED"}>
                        Place Bid
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No product data available.</p>
      )}

      {auction && (
        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-luxury-gold/10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-luxury-gold" /> Auction Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Auction Type</span>
                <span className="font-semibold text-gray-900">{auction.auctionType || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${auction.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>{auction.status || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lot Number</span>
                <span className="font-semibold text-luxury-gold">{auction.lotNumber || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Start Date</span>
                <span className="font-semibold text-gray-900">{auction.startDate ? new Date(auction.startDate).toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">End Date</span>
                <span className="font-semibold text-gray-900">{auction.endDate ? new Date(auction.endDate).toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Participants</span>
                <span className="font-semibold text-gray-900">{Array.isArray(auction.participants) ? auction.participants.length : 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-luxury-gold/10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-luxury-gold" /> Bid History & Updates
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold scrollbar-track-gray-100">
          {combinedHistory.length > 0 ? (
            combinedHistory.map((entry, index) => (
              <motion.div
                key={`${entry.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="flex-1">
                  {entry.type === "bid" ? (
                    <div>
                      <span className="font-semibold text-gray-900">{typeof entry.bidderName === "string" ? entry.bidderName : "Anonymous"}</span>
                      <span className="text-gray-600"> placed a bid of </span>
                      <span className="font-semibold text-luxury-gold">${(typeof entry.bidAmount === "number" ? entry.bidAmount : 0).toLocaleString()}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-blue-600">{typeof entry.sender === "string" ? entry.sender : "Admin"}</span>
                      <span className="text-gray-600">: </span>
                      <span className="text-gray-800">{typeof entry.message === "string" ? entry.message : "N/A"}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">{entry.bidTime ? new Date(entry.bidTime).toLocaleString() : "N/A"}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500">No bids or updates yet.</p>
          )}
        </div>
      </motion.div>

      <BillingDetailsModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} onBillingUpdate={handleBillingUpdate} />
      <PaymentMethodModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={handlePaymentSuccess} token={token} />
    </motion.div>
  );
}