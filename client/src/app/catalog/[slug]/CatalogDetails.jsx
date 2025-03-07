"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUserId } from "@/redux/authSlice";
import BidHistory from "./BidHistory";
import config from "@/app/config_BASE_URL";

export default function CatalogDetails({ product, auction, loading, onBidNowClick, token }) {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const userId = useSelector(selectUserId);

  const SkeletonCard = () => (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-square bg-gray-200 animate-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
      </div>
    </div>
  );

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
      const response = await fetch(`${config.baseURL}/v1/api/auction/join?=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          auctionId: auction._id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to join auction");
      }

      setIsJoined(true);
      toast.success("Successfully joined the auction!");
    } catch (error) {
      console.error("Join Auction Error:", error);
      toast.error(error.message || "Failed to join the auction.");
    }
  };

  const handleBidNowClick = () => {
    if (!auction) {
      toast.error("No active auction found for this product.");
      return;
    }
    const isEnded = auction.status === "ENDED" || new Date(auction.endDate) < new Date();
    if (isEnded) {
      toast.info(`This auction has ended. Winner: ${auction.currentBidder || "N/A"}`);
      return;
    }
    if (!isJoined) {
      toast.error("Please join the auction before bidding.");
      return;
    }
    setIsBidModalOpen(true);
  };

  const BidForm = () => {
    const [localBidAmount, setLocalBidAmount] = useState("");

    const handleBidSubmit = (event) => {
      event.preventDefault();
      const bidValue = parseFloat(localBidAmount);
      if (isNaN(bidValue) || bidValue <= auction.currentBid) {
        toast.error(`Bid must be greater than $${auction.currentBid}.`);
        return;
      }
      onBidNowClick(bidValue); // Only initiates payment intent, not bid placement
      setIsBidModalOpen(false);
    };

    return (
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-luxury-charcoal text-xl font-semibold">
            Place Your Bid
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleBidSubmit}>
          <div className="py-4 space-y-4">
            <p className="text-gray-600 mb-2">
              Current Bid: ${auction?.currentBid.toLocaleString()}
            </p>
            <Input
              type="number"
              value={localBidAmount}
              onChange={(e) => setLocalBidAmount(e.target.value)}
              placeholder="Enter your bid amount"
              className="w-full border-luxury-gold/20 focus:border-luxury-gold"
              min={auction?.currentBid + 1}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsBidModalOpen(false)}
              className="text-luxury-charcoal hover:text-luxury-gold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-luxury-gold text-black hover:bg-luxury-gold/80"
            >
              Proceed to Checkout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mb-12">
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
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-luxury-charcoal mb-4">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {product?.description ||
              "Join us for this exclusive auction featuring a curated selection of luxury items."}
          </p>
        </div>

        {auction ? (
          <div className="space-y-6">
            <div className="bg-luxury-charcoal text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Auction Details</h3>
              <p className="mb-2">
                Starting Price: <span className="font-bold">${auction.startingBid.toLocaleString()}</span>
              </p>
              <p className="mb-2">
                Current Bid: <span className="font-bold">${auction.currentBid.toLocaleString()}</span>
              </p>
              {product && (
                <p className="mb-4">
                  Estimated Price:{" "}
                  <span className="font-bold">
                    ${product.price.min.toLocaleString()} - ${product.price.max.toLocaleString()}
                  </span>
                </p>
              )}
              {auction.status === "ENDED" && (
                <p className="text-red-400 font-semibold mb-4">
                  Auction Ended - Winner: ${auction.currentBidder || "N/A"}
                </p>
              )}
              <div className="flex gap-4">
                {isJoined ? (
                  <Button
                    className="w-full bg-luxury-gold text-black font-semibold py-3 rounded-full hover:bg-luxury-gold/80 transition-colors"
                    onClick={handleBidNowClick}
                  >
                    Bid Now
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors"
                    onClick={handleJoinAuction}
                  >
                    Join Auction
                  </Button>
                )}
              </div>
            </div>
            <BidHistory bids={auction.bids || []} />
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No auction data available.</p>
        )}
      </div>

      <div className="mt-12">
        {loading ? (
          <SkeletonCard />
        ) : product ? (
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 max-w-md mx-auto">
            <div className="relative aspect-square mb-4">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded-md hover:scale-105 transition-transform duration-300"
              />
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Heart className="w-5 h-5 text-red-500" />
              </button>
            </div>
            <h3 className="text-lg font-medium text-luxury-charcoal line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-2">
              Est. ${product.price.min.toLocaleString()} - ${product.price.max.toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No product details available.</p>
        )}
      </div>

      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <BidForm />
      </Dialog>
    </div>
  );
}