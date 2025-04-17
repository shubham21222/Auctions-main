"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const AuctionCard = ({ auction, currentTime, currentAuctionId, onSelectAuction }) => {
  const [currentImage] = useState(0);
  const images = Array.isArray(auction.product?.image) ? auction.product.image : [];

  const endDate = auction.endDate ? new Date(auction.endDate) : null;
  const startDate = new Date(auction.startDate);
  const isEnded = auction.status === "ENDED" || (endDate && endDate < currentTime);
  const isLive = auction.status === "ACTIVE" && startDate <= currentTime && 
    (auction._id === currentAuctionId || auction._id === auction.nextActiveAuction?._id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ x: 5, backgroundColor: "#f8fafc" }}
      onClick={() => onSelectAuction(auction._id)}
      className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 cursor-pointer border-b border-gray-200 w-full transition-all duration-200 ease-in-out"
    >
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
        {images.length > 0 ? (
          <Image
            src={images[currentImage]}
            alt={auction.product?.title || "Auction Item"}
            fill
            className="object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            unoptimized={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 font-medium">
            {auction.lotNumber}
          </Badge>
          <Badge className={`${isLive ? "bg-emerald-600" : "bg-slate-600"} text-white font-medium`}>
            {isLive ? "LIVE" : isEnded ? "ENDED" : auction.status}
          </Badge>
        </div>
        <h3 className="text-base font-semibold text-slate-900 truncate mb-1">
          {auction.product?.title || "Untitled Auction"}
        </h3>
        <div className="text-sm text-slate-600">
          <span className="font-medium">${(auction.currentBid || auction.startingBid || 0).toLocaleString()}</span>
          {auction.status === "ACTIVE" && (
            <span className="text-xs text-slate-400 ml-2">
              ({auction.bids?.length || 0} bids)
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CatalogCarousel = ({ catalogName, auctions, currentTime, currentAuctionId, onSelectAuction }) => {
  const totalItems = auctions.length;
  const endedAuctions = auctions.filter((auction) => {
    const endDate = auction.endDate ? new Date(auction.endDate) : null;
    return auction.status === "ENDED" || (endDate && endDate < currentTime);
  }).length;

  // Reverse progress: show completion percentage
  const completionPercentage = totalItems > 0 ? (endedAuctions / totalItems) * 100 : 0;

  // Return early if no auctions
  if (totalItems === 0) {
    return (
      <div className="h-full w-full bg-white border-b lg:border-r border-gray-200 overflow-hidden shadow-lg">
        <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">{catalogName}</div>
          <div className="text-sm text-slate-600">No items available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white border-b lg:border-r border-gray-200 overflow-hidden shadow-lg">
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">{catalogName}</div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="font-medium">{endedAuctions} of {totalItems} Lots Completed</span>
          <div className="h-2.5 w-24 lg:w-32 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-80px)] lg:h-[calc(100vh-120px)] overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="divide-y divide-gray-200">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction._id}
              auction={auction}
              currentTime={currentTime}
              currentAuctionId={currentAuctionId}
              onSelectAuction={onSelectAuction}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogCarousel;