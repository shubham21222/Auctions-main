"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import LoginModal from "@/app/components/LoginModal";
import { motion, useMotionValue, useTransform } from "framer-motion";
import BillingPaymentModal from "@/app/components/BillingPaymentModal";
import config from "@/app/config_BASE_URL";

export function AuctionCard({ auction, walletBalance, currentTime }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBillingPaymentModalOpen, setIsBillingPaymentModalOpen] = useState(false);
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const cardRef = useRef(null);
  const auth = useSelector((state) => state.auth);
  const { token, user } = auth;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const carouselInterval = useRef(null);

  useEffect(() => {
    if (!auction || auction.auctionType !== "TIMED" || !auction.endDateRaw) {
      setTimeRemaining("N/A");
      return;
    }

    const updateTimer = () => {
      const endDate = new Date(auction.endDateRaw);
      const now = new Date();
      const timeDiff = endDate - now;

      if (timeDiff <= 0) {
        setTimeRemaining("Ended");
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [auction]);

  useEffect(() => {
    if (!auction || auction.images.length <= 1) return;

    carouselInterval.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % auction.images.length);
    }, 3000);

    return () => {
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current);
      }
    };
  }, [auction]);

  const endDate = auction.endDateRaw ? new Date(auction.endDateRaw) : null;
  const startDate = auction.startDateRaw ? new Date(auction.startDateRaw) : null;
  const isEnded = auction.status === "ENDED" || (endDate && endDate < currentTime);
  const isLive =
    auction.status === "ACTIVE" &&
    startDate &&
    startDate <= currentTime &&
    (!endDate || endDate > currentTime) &&
    auction.auctionType === "LIVE";
  const isTimed =
    auction.status === "ACTIVE" &&
    startDate &&
    startDate <= currentTime &&
    endDate &&
    endDate > currentTime &&
    auction.auctionType === "TIMED";

  const timeDiffInDays = endDate && auction.auctionType === "TIMED"
    ? (endDate - new Date()) / (1000 * 60 * 60 * 24)
    : Infinity;
  const timerColor = timeDiffInDays < 1 && !isEnded ? "text-red-500" : "text-green-500";

  const handleImageChange = (index) => {
    setCurrentImage(index);
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current);
      carouselInterval.current = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % auction.images.length);
      }, 3000);
    }
  };

  const handleMouseMove = (event) => {
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateXValue = (event.clientY - centerY) / 10;
    const rotateYValue = (event.clientX - centerX) / 10;

    x.set(rotateYValue);
    y.set(rotateXValue);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleBidNowClick = async () => {
    if (isEnded) {
      toast.info(`This auction has ended. Winner: ${auction.winner || "N/A"}`);
      window.open(
        `/catalog/${auction.id}`,
        "_blank",
        "width=1400,height=800,left=100,top=100,scrollbars=yes,resizable=yes"
      );
      return;
    }

    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    if (walletBalance < auction.currentBid) {
      toast.error(
        `Your wallet balance is less than $${auction.currentBid}. Please add balance to bid on this product.`
      );
      return;
    }

    const hasBillingDetails = user?.BillingDetails?.length > 0 || auth?.billingDetails;
    const hasPaymentMethod = user?.paymentMethodId || auth?.paymentMethodId;

    if (!hasBillingDetails || !hasPaymentMethod) {
      setIsBillingPaymentModalOpen(true);
      return;
    }

    window.open(
      `/catalog/${auction.id}`,
      "_blank",
      "width=1400,height=800,left=100,top=100,scrollbars=yes,resizable=yes"
    );
  };

  const handleOpenSignup = () => {
    setIsLoginModalOpen(false);
    toast.info("Please implement the signup modal logic.");
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transform: "perspective(1000px)",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] min-h-0"
      >
        <div className="absolute right-4 top-4 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </motion.button>
        </div>
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={auction.images[currentImage] || "/placeholder.svg"}
                alt={auction.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105"
                style={{ transform: "translateZ(0)" }}
              />
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-6">
              {auction.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                    style={{ transform: "translateZ(0)" }}
                  />
                </motion.button>
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
                isLive ? "bg-green-600" : isTimed ? "bg-blue-600" : "bg-gray-600"
              } text-white`}
            >
              {auction.auctionType === "LIVE" ? "Live" : "Timed"}
            </Badge>
          </div>
          <motion.h3
            className="text-xl font-semibold tracking-tight text-luxury-charcoal transition-colors group-hover:text-luxury-gold"
            whileHover={{ scale: 1.02 }}
          >
            {auction.title}
          </motion.h3>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-luxury-charcoal">Catalog:</span> {auction.catalogName}
          </div>
          {auction.auctionType === "TIMED" && endDate && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-luxury-gold" />
              <span>
                Ends: {endDate.toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric"
                })}
              </span>
            </div>
          )}
          {auction.auctionType === "TIMED" && endDate && !isEnded && (
            <div className={`mt-2 text-sm font-medium ${timerColor}`}>
              <Clock className="h-4 w-4 inline mr-1" />
              Time Remaining: {timeRemaining}
            </div>
          )}
          {auction.currentBid && (
            <motion.div
              className="mt-4 flex items-baseline gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm text-muted-foreground">Current Bid:</span>
              <span className="text-lg font-semibold text-luxury-charcoal">
                ${auction.currentBid.toLocaleString()}
              </span>
            </motion.div>
          )}
          {isEnded && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              Auction Ended
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
          </motion.div>
        </CardFooter>
      </motion.div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignup={handleOpenSignup}
      />
      <BillingPaymentModal
        isOpen={isBillingPaymentModalOpen}
        onClose={() => setIsBillingPaymentModalOpen(false)}
        onSuccess={() => {
          toast.success("Billing details and payment method added successfully!");
          window.open(
            `/catalog/${auction.id}`,
            "_blank",
            "width=1400,height=800,left=100,top=100,scrollbars=yes,resizable=yes"
          );
        }}
        token={token}
        email={user?.email}
      />
    </>
  );
}