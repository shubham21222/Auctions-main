"use client";

import Image from "next/image";
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

export default function CatalogDetails({ product, auction, loading, onBidNowClick, token, notifications }) {
  const [isJoined, setIsJoined] = useState(false);
  const [userCache, setUserCache] = useState({});
  const [bidsWithUsernames, setBidsWithUsernames] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [adminMessages, setAdminMessages] = useState([]); // Store admin messages for bid history
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

  // Update bids with usernames
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

  // Add admin messages to bid history
  useEffect(() => {
    const adminNotifications = notifications.filter((n) => n.type === "info");
    setAdminMessages((prev) =>
      adminNotifications.map((n) => ({
        message: n.message,
        bidTime: new Date(n.id), // Use notification ID as a timestamp
      }))
    );
  }, [notifications]);

  const handleJoinAuction = async () => {
    if (!userId) {
      toast.error("Please log in to join the auction");
      return;
    }
    if (!auction) {
      toast.error("No active auction available");
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

    if (isNaN(bidValue) || bidValue < minBid) {
      toast.error(`Bid must be at least $${minBid.toLocaleString()} (increment: $${bidIncrement.toLocaleString()}).`);
      return;
    }

    onBidNowClick(bidValue);
    setBidAmount("");
  };

  // Combine bids and admin messages for display in bid history
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
    })),
  ].sort((a, b) => new Date(a.bidTime) - new Date(b.bidTime));

  return (
    <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : product ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {product.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <Image
                src={image}
                alt={`${product.name} image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No product images available.</p>
      )}

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {product?.description || "No description available."}
          </p>
        </div>

        {auction ? (
          <div className="space-y-6">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Auction Details</h3>
              <p>Starting Price: ${auction.startingBid.toLocaleString()}</p>
              <p>Current Bid: ${auction.currentBid.toLocaleString()}</p>
              <p>Bid Increment: ${getBidIncrement(auction.currentBid).toLocaleString()}</p>
              <p>Minimum Next Bid: ${(auction.currentBid + getBidIncrement(auction.currentBid)).toLocaleString()}</p>
              <p>Watchers: {auction.watchers || 0}</p>
              {auction.status === "ENDED" && (
                <p className="text-red-400 mt-2">
                  Auction Ended - Winner: {auction.winner || "N/A"}
                </p>
              )}

              {!isJoined ? (
                <Button
                  onClick={handleJoinAuction}
                  className="mt-4 bg-green-500 text-white hover:bg-green-600"
                >
                  Join Auction
                </Button>
              ) : auction.status !== "ENDED" ? (
                <form onSubmit={handleBidSubmit} className="mt-4 flex gap-2">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Enter at least $${(auction.currentBid + getBidIncrement(auction.currentBid)).toLocaleString()}`}
                    min={auction.currentBid + getBidIncrement(auction.currentBid)}
                    step={getBidIncrement(auction.currentBid)}
                    className="w-full border-gray-300 focus:border-blue-500"
                    disabled={auction.status === "ENDED"}
                  />
                  <Button
                    type="submit"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    disabled={auction.status === "ENDED"}
                  >
                    {auction.auctionType === "LIVE" ? "Place Bid" : "Proceed to Checkout"}
                  </Button>
                </form>
              ) : null}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Bid History & Admin Messages</h3>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {combinedHistory.map((entry, index) => (
                  <li key={index} className="text-sm">
                    {entry.type === "bid" ? (
                      <span>
                        {entry.bidderName} bid ${entry.bidAmount.toLocaleString()} -{" "}
                        {new Date(entry.bidTime).toLocaleTimeString()}
                      </span>
                    ) : (
                      <span className="text-blue-600">
                        {entry.message} - {new Date(entry.bidTime).toLocaleTimeString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No auction data available.</p>
        )}
      </div>
    </div>
  );
}
