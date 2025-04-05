"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
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
      const updatedBids = await Promise.all(
        auction.bids.map(async (bid) => {
          const bidderName = await fetchUserName(bid.bidder);
          return { ...bid, bidderName };
        })
      );
      setBidsWithUsernames(updatedBids);
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
        socket.emit("joinAuction", { auctionId: auction._id });
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

  const combinedHistory = [
    ...bidsWithUsernames.map((bid) => ({
      type: "bid",
      bidderName: bid.bidderName,
      bidAmount: bid.bidAmount,
      bidTime: bid.bidTime,
      bidType: bid.bidType,
    })),
    ...(messages || []).map((msg) => ({
      type: "message",
      message: msg.message || msg.actionType || "Update",
      bidTime: msg.timestamp || new Date(),
      sender: msg.sender || "Admin",
      bidType: msg.bidType || "message",
    })),
    {
      type: "lot",
      message: `Lot ${auction?.lotNumber || "N/A"} is now open for bidding`,
      bidTime: auction?.startDate || new Date(),
      sender: "System",
      bidType: "lot_open",
    },
  ].sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

  useEffect(() => {
    if (updatesRef.current) {
      updatesRef.current.scrollTop = updatesRef.current.scrollHeight;
    }
  }, [combinedHistory]);

  const productImages = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [];

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      <div className="flex-1 max-w-[800px] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col gap-8 pb-6">
              <div className="relative h-[500px] rounded-xl overflow-hidden bg-slate-100 shadow-md">
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
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500">
                    No images available
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index ? "border-emerald-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {imageErrors[index] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500">
                          Error
                        </div>
                      ) : (
                        <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" unoptimized={true} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-6 px-2">
                <h1 className="text-3xl font-bold text-slate-900">{product?.name}</h1>
                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {renderHTML(product?.description)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 mt-auto shadow-lg z-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Current Bid</span>
                <span className="text-4xl font-bold text-slate-900">
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
                        I agree to the terms and conditions
                      </label>
                    </div>
                    <Button
                      onClick={handleJoinAuction}
                      disabled={!termsAccepted}
                      className={`w-full py-6 text-lg font-medium transition-all duration-200 ${
                        termsAccepted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Join Auction to Bid
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleBidSubmit}
                    className="w-full py-6 text-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
                  >
                    Place Bid: ${((auction.currentBid || 0) + getBidIncrement(auction.currentBid || 0)).toLocaleString()}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[400px] border-slate-500 bg-white rounded-xl shadow-sm">
        <div className="h-[500px] flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Auction Updates</h2>
            {auction?.status === "ACTIVE" && (
              <div className="mt-4 bg-emerald-50 text-emerald-800 px-4 py-3 rounded-lg flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Live Auction
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-[80px]" ref={updatesRef}>
            {combinedHistory.slice().reverse().map((entry, index) => (
              <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-200">
                {entry.type === "bid" ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">${entry.bidAmount.toLocaleString()}</span>
                      <span className={`text-sm font-medium ${entry.bidType === "online" ? "text-blue-600" : "text-red-600"}`}>
                        {entry.bidType === "online" ? "(Online Bid)" : "(Competitive Bid)"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(entry.bidTime).toLocaleTimeString()}</span>
                  </div>
                ) : entry.type === "lot" ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-emerald-600 font-medium">{entry.message}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(entry.bidTime).toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-emerald-600">{entry.message}</span>
                      <span className="text-xs text-slate-500">— {entry.sender}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(entry.bidTime).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            ))}
            {combinedHistory.length === 0 && (
              <div className="text-center text-slate-500 py-4">No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}