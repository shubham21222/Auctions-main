"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AuctionCard = ({ auction, currentTime, onSelectAuction }) => {
  const [currentImage] = useState(0);
  const images = auction.product?.image || ["/placeholder.svg"];

  const endDate = auction.endDate ? new Date(auction.endDate) : null;
  const startDate = new Date(auction.startDate);
  const isEnded = auction.status === "ENDED" || (endDate && endDate < currentTime);
  const isLive = auction.status === "ACTIVE" && startDate <= currentTime;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ x: 5 }}
      onClick={() => onSelectAuction(auction._id)}
      className="flex items-center gap-4 p-3 bg-white hover:bg-gray-50 cursor-pointer border-b border-gray-200 w-full"
    >
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={images[currentImage]}
          alt={auction.product?.title || "Auction Item"}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {auction.lotNumber}
          </Badge>
          <Badge className={`${isLive ? "bg-green-600" : "bg-gray-600"} text-white`}>
            {isLive ? "LIVE" : auction.status}
          </Badge>
        </div>
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {auction.product?.title || "Untitled Auction"}
        </h3>
        <div className="text-sm text-gray-500">
          ${(auction.currentBid || auction.startingBid || 0).toLocaleString()}
          {auction.status === "ACTIVE" && (
            <span className="text-xs text-gray-400 ml-2">
              ({auction.bids?.length || 0} bids)
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CatalogCarousel = ({ catalogName, auctions, currentTime, onSelectAuction }) => {
  const totalItems = auctions.length;
  const endedAuctions = auctions.filter(auction => {
    const endDate = auction.endDate ? new Date(auction.endDate) : null;
    return auction.status === "ENDED" || (endDate && endDate < currentTime);
  }).length;
  
  const itemsRemaining = totalItems - endedAuctions;

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-[350px] bg-white border-r border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 mt-[120px]">
        <div className="text-xl font-bold text-gray-800 mb-2">{catalogName}</div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{itemsRemaining} of {totalItems} Lots Remaining</span>
          <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 rounded-full" 
              style={{ width: `${(itemsRemaining / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-130px)] overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction._id}
              auction={auction}
              currentTime={currentTime}
              onSelectAuction={onSelectAuction}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogCarousel;