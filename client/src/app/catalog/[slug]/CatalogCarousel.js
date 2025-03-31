"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AuctionCard = ({ auction, currentTime, onSelectAuction }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = auction.product?.image || ["/placeholder.svg"];

  const endDate = auction.endDate ? new Date(auction.endDate) : null;
  const startDate = new Date(auction.startDate);
  const isEnded = auction.status === "ENDED" || (endDate && endDate < currentTime);
  const isLive =
    auction.status === "ACTIVE" &&
    startDate <= currentTime &&
    (!endDate || endDate > currentTime) &&
    auction.auctionType === "LIVE";
  const isTimed =
    auction.status === "ACTIVE" &&
    startDate <= currentTime &&
    (!endDate || endDate > currentTime) &&
    auction.auctionType === "TIMED";

  const timeDiff = endDate ? endDate - currentTime : Infinity;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const timeRemaining = isEnded ? "Ended" : `${days}d ${hours}h ${minutes}m`;
  const timerColor = timeDiff < 24 * 60 * 60 * 1000 && !isEnded ? "text-red-500" : "text-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className="group flex-shrink-0 w-[320px] overflow-hidden shadow-lg hover:shadow-2xl bg-white/95 backdrop-blur-sm transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] cursor-pointer border border-luxury-gold/10 hover:border-luxury-gold/30"
        onClick={() => onSelectAuction(auction._id)}
      >
        <CardHeader className="p-0 relative">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={images[currentImage]}
              alt={auction.product?.title || "Auction Item"}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4">
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(index);
                  }}
                  className={`relative h-10 w-10 overflow-hidden rounded-md transition-all hover:scale-110 border-2 ${
                    currentImage === index
                      ? "border-luxury-gold ring-2 ring-offset-2 ring-luxury-gold/50"
                      : "border-white/50 hover:border-luxury-gold"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${auction.product?.title || "Auction Item"} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-luxury-gold/10 text-luxury-gold">
              {auction.lotNumber}
            </Badge>
            <Badge
              className={`${isLive ? "bg-green-600" : isTimed ? "bg-blue-600" : "bg-gray-600"} text-white`}
            >
              {isLive ? "Live" : isTimed ? "Timed" : auction.auctionType}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-luxury-charcoal transition-colors group-hover:text-luxury-gold truncate">
            {auction.product?.title || "Untitled Auction"}
          </h3>
          <div className="mt-2 text-sm text-muted-foreground truncate">
            <span className="font-medium text-luxury-charcoal">Current Bid:</span> $
            {(auction.currentBid || auction.startingBid || 0).toLocaleString()}
          </div>
          <div className={`mt-2 text-sm font-medium ${timerColor}`}>
            Time Remaining: {timeRemaining}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CatalogCarousel = ({ catalogName, auctions, currentTime, onSelectAuction }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const itemsPerView = 3;
  const totalItems = auctions.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-14 relative max-w-[1500px] mx-auto px-4">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="bg-white/90 backdrop-blur-sm text-luxury-gold hover:bg-white hover:text-luxury-charcoal rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          className="bg-white/90 backdrop-blur-sm text-luxury-gold hover:bg-white hover:text-luxury-charcoal rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className="overflow-hidden py-8">
        <motion.div
          ref={carouselRef}
          className="flex gap-8"
          animate={{ x: `-${currentIndex * (320 + 32)}px` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {auctions.map((auction) => (
            <AuctionCard
              key={auction._id}
              auction={auction}
              currentTime={currentTime}
              onSelectAuction={onSelectAuction}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CatalogCarousel;