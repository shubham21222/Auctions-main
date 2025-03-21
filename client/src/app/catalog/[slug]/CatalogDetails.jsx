"use client";

import Image from "next/image";
import Link from "next/link"; // Import Link for navigation to /terms page
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import BidHistory from "./BidHistory";
import config from "@/app/config_BASE_URL";

// Bid increment rules
const getBidIncrement = (currentBid) => {
  if (currentBid >= 1000000) return 50000;
  if (currentBid >= 500000) return 25000;
  if (currentBid >= 250000) return 10000;
  if (currentBid >= 100000) return 5000;
  if (currentBid >= 50000) return 2500;
  if (currentBid >= 25000) return 1000;
  if (currentBid >= 10000) return 500;
  if (currentBid >= 5000) return 250;
  if (currentBid >= 1000) return 100;
  if (currentBid >= 100) return 50;
  if (currentBid >= 50) return 10;
  if (currentBid >= 25) return 5;
  return 1;
};

export default function CatalogDetails({ product, auction, loading, onBidNowClick, token, notifications, socket, messages }) {
  const [isJoined, setIsJoined] = useState(false);
  const [userCache, setUserCache] = useState({});
  const [bidsWithUsernames, setBidsWithUsernames] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [adminMessages, setAdminMessages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false); // State for terms checkbox
  const userId = useSelector((state) => state.auth._id);

  const SkeletonCard = () => (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-square bg-gray-200 animate-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
      </div>
    </div>
  );

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

  useEffect(() => {
    if (!auction?.bids) {
      setBidsWithUsernames([]);
      return;
    }

    const updateBidsWithUsernames = async () => {
      try {
        const updatedBids = await Promise.all(
          auction.bids.map(async (bid) => ({
            ...bid,
            bidderName: await fetchUserName(bid.bidder),
          }))
        );
        setBidsWithUsernames(updatedBids);
      } catch (error) {
        console.error("Error updating bids:", error);
        setBidsWithUsernames(auction.bids.map((bid) => ({ ...bid, bidderName: bid.bidder })));
      }
    };

    updateBidsWithUsernames();
  }, [auction, fetchUserName]);

  useEffect(() => {
    console.log("Messages prop updated:", messages);
    if (messages && Array.isArray(messages)) {
      const formattedMessages = messages.map((msg) => ({
        message: msg.message || msg.actionType,
        bidTime: msg.timestamp || new Date(),
        sender: typeof msg.sender === "object" ? msg.sender.name || "Admin" : msg.sender || "Admin",
        type: msg.type || "message"
      }));
      console.log("Formatted messages:", formattedMessages);
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
    if (!auction) {
      toast.error("No active auction available");
      return;
    }
    if (!termsAccepted) {
      toast.error("You must accept the terms and conditions to join the auction.");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/join?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ auctionId: auction._id }),
      });

      if (!response.ok) throw new Error("Failed to join auction");
      setIsJoined(true);
      toast.success("Successfully joined the auction!");
    } catch (error) {
      console.error("Join Auction Error:", error);
      toast.error("Failed to join the auction.");
    }
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    const currentBid = auction?.currentBid || 0;
    const bidIncrement = getBidIncrement(currentBid);
    const minBid = currentBid + bidIncrement;
    const bidValue = parseFloat(bidAmount);

    if (isNaN(bidValue)) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    if (bidValue < minBid) {
      toast.error(`Bid must be at least $${minBid.toLocaleString()}`);
      return;
    }

    const roundedBid = Math.round(bidValue * 100) / 100;
    onBidNowClick(roundedBid);
    setBidAmount("");
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

  console.log("Combined history:", combinedHistory);

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : product ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-24 flex md:flex-col gap-2 flex-col overflow-x-auto md:overflow-x-visible">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                      selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={`${product.name} main image`}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product?.description || "No description available."}
              </p>
            </div>

            {auction && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Place Your Bid</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Bid</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${auction.currentBid?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Minimum Bid</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${(auction.currentBid + getBidIncrement(auction.currentBid || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bid Increment</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${getBidIncrement(auction.currentBid || 0).toLocaleString()}
                    </span>
                  </div>
                  {!isJoined ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="h-5 w-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="terms" className="text-gray-600 text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms and Conditions
                          </Link>
                        </label>
                      </div>
                      <Button
                        onClick={handleJoinAuction}
                        className="w-full bg-green-500 text-white hover:bg-green-600"
                        disabled={!termsAccepted} // Disable button if terms are not accepted
                      >
                        Join Auction
                      </Button>
                    </div>
                  ) : auction.status !== "ENDED" ? (
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter at least $${(auction.currentBid + getBidIncrement(auction.currentBid || 0)).toLocaleString()}`}
                        min={auction.currentBid + getBidIncrement(auction.currentBid || 0)}
                        className="w-full border-gray-300 focus:border-blue-500"
                        disabled={auction.status === "ENDED"}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-blue-500 text-white hover:bg-blue-600"
                        disabled={auction.status === "ENDED"}
                      >
                        {auction.auctionType === "LIVE" ? "Place Bid" : "Proceed to Checkout"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No product images available.</p>
      )}

      {auction && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Auction Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Auction Type</span>
                <span className="font-semibold text-gray-900">{auction.auctionType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${auction.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                  {auction.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lot Number</span>
                <span className="font-semibold text-gray-900">{auction.lotNumber}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Start Date</span>
                <span className="font-semibold text-gray-900">
                  {new Date(auction.startDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">End Date</span>
                <span className="font-semibold text-gray-900">
                  {new Date(auction.endDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Participants</span>
                <span className="font-semibold text-gray-900">{auction.participants?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Bid History & Updates</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {combinedHistory.length > 0 ? (
            combinedHistory.map((entry, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  {entry.type === "bid" ? (
                    <div>
                      <span className="font-semibold text-gray-900">{entry.bidderName}</span>
                      <span className="text-gray-600"> placed a bid of </span>
                      <span className="font-semibold text-blue-600">${entry.bidAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-blue-600">{entry.sender}</span>
                      <span className="text-gray-600">: </span>
                      <span className="text-gray-800">{entry.message}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(entry.bidTime).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No bids or updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}