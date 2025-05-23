"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
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
  return htmlString
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
};

export default function CatalogDetails({
  product,
  auction,
  loading,
  onBidNowClick,
  onSendMessage,
  onClerkAction,
  token,
  notifications,
  socket,
  messages,
  isJoined,
  setIsJoined,
  userId,
  isClerk,
  auctionMode,
  updateAuctionMode,
}) {
  const [userCache, setUserCache] = useState({});
  const [bidsWithUsernames, setBidsWithUsernames] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showCustomBidModal, setShowCustomBidModal] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState("");
  const updatesRef = useRef(null);

  const fetchUserName = useCallback(
    async (id) => {
      if (!token || !id) return "Anonymous";
      if (userCache[id]) return userCache[id];

      try {
        const response = await fetch(`${config.baseURL}/v1/api/auth/getUserById/${id}`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        const userName = data.items?.name || "Anonymous";
        setUserCache((prev) => ({ ...prev, [id]: userName }));
        return userName;
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error.message);
        return "Anonymous";
      }
    },
    [token, userCache]
  );

  useEffect(() => {
    if (!auction?.bids) {
      setBidsWithUsernames([]);
      return;
    }

    const updateBidsWithUsernames = async () => {
      const uniqueBids = new Map();

      auction.bids.forEach((bid) => {
        const bidTime = new Date(bid.bidTime).getTime();
        const key = `${bid.bidAmount}-${Math.floor(bidTime / 1000)}`;

        if (uniqueBids.has(key)) {
          const existingBid = uniqueBids.get(key);
          if (!existingBid.bidType && bid.bidType) {
            uniqueBids.set(key, bid);
          }
        } else {
          uniqueBids.set(key, bid);
        }
      });

      const updatedBids = await Promise.all(
        Array.from(uniqueBids.values()).map(async (bid) => {
          const bidderName = await fetchUserName(bid.bidder);
          return { ...bid, bidderName, bidType: bid.bidType || "online" };
        })
      );

      const finalBids = updatedBids
        .sort((a, b) => new Date(a.bidTime) - new Date(b.bidTime))
        .filter((bid, index, array) => {
          if (index === 0) return true;
          const prevBid = array[index - 1];
          const timeDiff = Math.abs(new Date(bid.bidTime) - new Date(prevBid.bidTime));
          return !(bid.bidAmount === prevBid.bidAmount && timeDiff < 1000);
        });

      console.log("CatalogDetails: Updated bids with usernames:", finalBids);
      setBidsWithUsernames(finalBids);
    };

    updateBidsWithUsernames();
  }, [auction?.bids, fetchUserName]);

  const handleJoinAuction = async () => {
    if (!userId || !auction || !auction._id || !termsAccepted) {
      toast.error(
        !userId
          ? "Please log in to join the auction"
          : !auction || !auction._id
          ? "No active auction available"
          : "You must accept the terms and conditions"
      );
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ auctionId: auction._id, userId }),
      });

      const data = await response.json();
      if (!response.ok && data.message !== "User already joined the auction") {
        throw new Error(data.message || "Failed to join auction");
      }

      setIsJoined(true);
      toast.success("Successfully joined the auction!");
      if (socket && socket.connected) {
        socket.emit("joinAuction", { auctionId: auction._id, userId, isClerk });
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
    onBidNowClick(isClerk ? "competitor" : "online", nextBid);
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    const bidAmount = parseFloat(customBidAmount);
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    if (bidAmount <= (auction?.currentBid || 0)) {
      toast.error("Bid amount must be greater than current bid");
      return;
    }

    onBidNowClick(isClerk ? "competitor" : "online", bidAmount);
    setShowCustomBidModal(false);
    setCustomBidAmount("");
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    onSendMessage(message);
    setMessage("");
  };

  const bidHistory = [...bidsWithUsernames, ...(auction?.messages || [])]
    .sort((a, b) => new Date(a.bidTime || a.timestamp) - new Date(b.bidTime || b.timestamp));

  useEffect(() => {
    if (updatesRef.current) {
      updatesRef.current.scrollTop = updatesRef.current.scrollHeight;
    }
  }, [bidHistory]);

  const productImages = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-120px)]">
      <div className="flex-1 max-w-full lg:max-w-[800px] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
            <div className="flex flex-col gap-6 lg:gap-8 pb-6">
              <div className="relative h-[300px] lg:h-[500px] rounded-xl overflow-hidden bg-slate-100 shadow-md">
                {productImages.length > 0 ? (
                  imageErrors[selectedImageIndex] ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500">
                      Image not available
                    </div>
                  ) : (
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={`${product?.name || "Product"} main image`}
                      fill
                      className="object-contain transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        console.error(`Failed to load image: ${productImages[selectedImageIndex]}`);
                        setImageErrors((prev) => ({ ...prev, [selectedImageIndex]: true }));
                      }}
                      onLoad={() => console.log(`Loaded image: ${productImages[selectedImageIndex]}`)}
                      unoptimized={true}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500">
                    No images available
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-2 lg:gap-4 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index ? "border-emerald-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {imageErrors[index] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500">
                          Error
                        </div>
                      ) : (
                        <Image 
                          src={image} 
                          alt={`Thumbnail ${index + 1}`} 
                          fill 
                          className="object-cover" 
                          unoptimized={true}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4 lg:space-y-6 px-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{product?.name}</h1>
                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed max-h-[300px] lg:max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {renderHTML(auction?.product?.description || product?.description)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 lg:p-6 mt-auto shadow-lg z-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-slate-50 p-4 lg:p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Current Bid</span>
                <span className="text-3xl lg:text-4xl font-bold text-slate-900">
                  ${(auction?.currentBid || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {auction && auction.status === "ACTIVE" && (
              <div className="space-y-4">
                {!isJoined ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600">
                        I agree to the <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">terms and conditions</Link>
                      </label>
                    </div> 
                    <Button
                      onClick={handleJoinAuction}
                      disabled={!termsAccepted}
                      className={`w-full py-4 lg:py-6 text-base lg:text-lg font-medium transition-all duration-200 ${
                        termsAccepted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Join Auction to Bid
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={handleBidSubmit}
                      className="w-full py-4 lg:py-6 text-base lg:text-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
                    >
                      Place {isClerk ? "Competitive" : "Online"} Bid: ${((auction.currentBid || 0) + getBidIncrement(auction.currentBid || 0)).toLocaleString()}
                    </Button>
                    <Button
                      onClick={() => setShowCustomBidModal(true)}
                      className="w-full py-4 lg:py-6 text-base lg:text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                    >
                      Place Custom Bid
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isClerk && (
              <div className="space-y-4">
                <select
                  value={auctionMode}
                  onChange={(e) => updateAuctionMode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="competitor">Competitor Mode</option>
                  <option value="online">Online Mode</option>
                </select>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && message.trim()) {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
                  >
                    Measures
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {["FAIR_WARNING", "FINAL_CALL", "RESERVE_NOT_MET", "NEXT_LOT", "SOLD", "RETRACT"].map((action) => (
                    <Button
                      key={action}
                      onClick={() => onClerkAction(action)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
                    >
                      {action.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] border-slate-500 bg-white rounded-xl shadow-sm">
        <div className="h-[300px] lg:h-[500px] flex flex-col">
          <div className="p-4 lg:p-6 border-b border-slate-200">
            <h2 className="text-lg lg:text-xl font-semibold text-slate-900">Auction Updates</h2>
            {auction?.status === "ACTIVE" && (
              <div className="mt-4 bg-emerald-50 text-emerald-800 px-4 py-3 rounded-lg flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                {auction?.auctionType === "TIMED" ? "Timed Auction" : "Live Auction"}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-[80px]" ref={updatesRef}>
            {[...bidHistory]
              .sort((a, b) => new Date(a.bidTime || a.timestamp) - new Date(b.bidTime || b.timestamp))
              .map((entry, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  {entry.message ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-blue-600 font-medium ${entry.actionType === "SOLD" ? "text-green-600" : ""}`}>
                          {entry.message}
                        </span>
                        <span className="text-sm text-slate-500">({entry.sender || (isClerk ? "Clerk" : "Admin")})</span>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(entry.timestamp || entry.bidTime).toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">${entry.bidAmount.toLocaleString()}</span>
                        <span className={`text-sm font-medium ${entry.bidType === "online" ? "text-blue-600" : "text-red-600"}`}>
                          {entry.bidType === "online" ? "(Online Bid)" : "(Competitive Bid)"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(entry.bidTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            {bidHistory.length === 0 && (
              <div className="text-center text-slate-500 py-4">No updates yet</div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCustomBidModal} onOpenChange={setShowCustomBidModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Custom Bid</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCustomBidSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bid Amount ($)</label>
              <Input
                type="number"
                value={customBidAmount}
                onChange={(e) => setCustomBidAmount(e.target.value)}
                placeholder="Enter your bid amount"
                min={auction?.currentBid || 0}
                step="0.01"
                required
                className="w-full"
              />
              <p className="text-sm text-slate-500">
                Current bid: ${(auction?.currentBid || 0).toLocaleString()}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomBidModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Place Bid
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};