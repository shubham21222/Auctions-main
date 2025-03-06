"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export function AuctionCard({ auction, walletBalance, currentTime }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const endDate = new Date(auction.endDateRaw);
  const startDate = new Date(auction.startDateRaw);
  const isEnded = auction.status === "ENDED" || endDate < currentTime;
  const isLive =
    auction.status === "ACTIVE" && startDate <= currentTime && endDate > currentTime;

  console.log(`Auction ${auction.id}:`, {
    startDateRaw: auction.startDateRaw,
    endDateRaw: auction.endDateRaw,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    currentTime: currentTime.toISOString(),
    isLive,
    isEnded,
    status: auction.status,
    auctionType: auction.auctionType,
  });

  const handleBidNowClick = () => {
    if (isEnded) {
      toast.info(`This auction has ended. Winner: ${auction.winner || "N/A"}`);
      router.push(`/catalog/${auction.id}`);
      return;
    }

    if (!isLoggedIn) {
      toast.error("Please login or signup to place a bid.", {
        action: {
          text: "Login/Signup",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    if (walletBalance < auction.currentBid) {
      toast.error(
        `Your wallet balance is less than $${auction.currentBid}. Please add balance to bid on this product.`
      );
      return;
    }

    router.push(`/catalog/${auction.id}`);
  };

  return (
    <Card className="group relative overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]">
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={auction.images[currentImage] || "/placeholder.svg"}
            alt={auction.title}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-6">
            {auction.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative h-16 w-16 overflow-hidden rounded-md transition-all hover:scale-105 ${
                  currentImage === index
                    ? "ring-2 ring-luxury-gold ring-offset-2"
                    : "border-2 border-white/50 hover:border-white"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${auction.title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="bg-luxury-gold/10 text-luxury-gold">
            {auction.lotNumber}
          </Badge>
          {auction.featured && (
            <Badge className="bg-luxury-charcoal text-luxury-cream">Featured</Badge>
          )}
          <Badge
            className={`${
              isLive ? "bg-green-600" : "bg-gray-600"
            } text-white`}
          >
            {isLive ? "Live" : auction.auctionType}
          </Badge>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-luxury-charcoal transition-colors group-hover:text-luxury-gold">
          {auction.title}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-luxury-gold" />
          <span>Ends: {auction.endDateTime}</span>
        </div>
        {auction.currentBid && (
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Current Bid:</span>
            <span className="text-lg font-semibold text-luxury-charcoal">
              ${auction.currentBid.toLocaleString()}
            </span>
          </div>
        )}
        {isEnded && (
          <div className="mt-4 text-center text-red-500 font-semibold">
            Auction Ended
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="group/btn relative w-full overflow-hidden bg-black transition-all hover:bg-luxury-gold"
          size="lg"
          onClick={handleBidNowClick}
        >
          <span className="relative z-10 flex items-center text-white gap-2">
            Bid Now
            <span className="text-sm opacity-70">→</span>
          </span>
          <div className="absolute inset-0 -z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] bg-[0%_0%] transition-all duration-500 group-hover/btn:bg-[100%_100%]" />
        </Button>
      </CardFooter>
    </Card>
  );
}