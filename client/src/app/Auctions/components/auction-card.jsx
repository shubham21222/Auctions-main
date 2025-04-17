"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import LoginModal from "@/app/components/LoginModal";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import BillingPaymentModal from "@/app/components/BillingPaymentModal";
import config from "@/app/config_BASE_URL";
import { VerificationModal } from "@/app/components/VerificationModal";

export function AuctionCard({ auction, walletBalance, currentTime }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBillingPaymentModalOpen, setIsBillingPaymentModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const cardRef = useRef(null);
  const auth = useSelector((state) => state.auth);
  const { token, user, billingDetails, paymentMethodId } = auth;

  // 3D effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  // Add carousel interval ref
  const carouselInterval = useRef(null);

  const endDate = auction.endDateRaw ? new Date(auction.endDateRaw) : null;
  const startDate = new Date(auction.startDateRaw);
  const isEnded =
    auction.status === "ENDED" || (endDate && endDate < currentTime);
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

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      if (!endDate) {
        setTimeRemaining("N/A");
        return;
      }

      const now = new Date();
      const timeDiff = endDate - now;

      if (timeDiff <= 0) {
        setTimeRemaining("Ended");
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  const timeDiffInDays = endDate
    ? (endDate - new Date()) / (1000 * 60 * 60 * 24)
    : Infinity;
  const timerColor =
    timeDiffInDays < 1 && !isEnded ? "text-red-500" : "text-green-500";

  // Add useEffect for automatic carousel
  useEffect(() => {
    if (auction.images.length > 1) {
      carouselInterval.current = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % auction.images.length);
      }, 3000); // Change image every 3 seconds

      return () => {
        if (carouselInterval.current) {
          clearInterval(carouselInterval.current);
        }
      };
    }
  }, [auction.images.length]);

  // Add function to handle manual image change
  const handleImageChange = (index) => {
    setCurrentImage(index);
    // Reset the interval when manually changing images
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
    if (auction.status === "ended") {
      toast.error("This auction has ended");
      return;
    }

    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    // Check if email is verified
    if (!user?.isEmailVerified) {
      setIsVerificationModalOpen(true);
      return;
    }

    // Check wallet balance
    if (walletBalance < auction.currentBid) {
      toast.error("Insufficient wallet balance");
      return;
    }

    // Check if user has both billing details and payment method
    const hasBillingDetails = user?.BillingDetails?.length > 0 || auth?.billingDetails;
    const hasPaymentMethod = user?.paymentMethodId || auth?.paymentMethodId;

    if (!hasBillingDetails || !hasPaymentMethod) {
      setIsBillingPaymentModalOpen(true);
      return;
    }

    // If all checks pass, open catalog
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
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(212,175,55,0.2)] min-h-0"
      >
        <div className="absolute right-4 top-4 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="rounded-full bg-white/90 p-2.5 backdrop-blur-sm shadow-lg transition-all hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </motion.button>
        </div>
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </motion.div>

            {/* Carousel Indicators */}
            {auction.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {auction.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      currentImage === index
                        ? "bg-luxury-gold w-4"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20"
            >
              {auction.lotNumber}
            </Badge>
            {auction.featured && (
              <Badge className="bg-luxury-charcoal/90 text-luxury-cream border border-luxury-charcoal/20">
                Featured
              </Badge>
            )}
            <Badge
              className={`${
                isLive
                  ? "bg-green-600/90"
                  : isTimed
                  ? "bg-blue-600/90"
                  : "bg-gray-600/90"
              } text-white border border-white/20`}
            >
              {isLive ? "Live" : isTimed ? "Timed" : auction.auctionType}
            </Badge>
          </div>
          <motion.h3
            className="text-xl font-semibold tracking-tight text-luxury-charcoal transition-colors group-hover:text-luxury-gold line-clamp-2"
            whileHover={{ scale: 1.02 }}
          >
            {auction.title}
          </motion.h3>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-luxury-charcoal">Catalog:</span>{" "}
            {auction.catalogName}
          </div>
          {auction.auctionType === "TIMED" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-luxury-gold" />
              <span>
                Ends:{" "}
                {new Date(auction.endDateRaw).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {auction.auctionType === "TIMED" && (
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
              <span className="text-sm text-muted-foreground">
                Current Bid:
              </span>
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
            className="w-full"
          >
            <Button
              className="group/btn relative w-full overflow-hidden bg-gradient-to-r from-luxury-charcoal to-luxury-charcoal/90 transition-all hover:from-luxury-gold hover:to-luxury-gold/90"
              size="lg"
              onClick={handleBidNowClick}
            >
              <span className="relative z-10 flex items-center text-white gap-2">
                Bid Now
                <span className="text-sm opacity-70 group-hover/btn:translate-x-1 transition-transform">
                  →
                </span>
              </span>
              <div className="absolute inset-0 -z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] bg-[0%_0%] transition-all duration-500 group-hover/btn:bg-[100%_100%]" />
            </Button>
          </motion.div>
        </CardFooter>
      </motion.div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        email={user?.email}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignup={handleOpenSignup}
      />

      <BillingPaymentModal
        isOpen={isBillingPaymentModalOpen}
        onClose={() => setIsBillingPaymentModalOpen(false)}
        onSuccess={() => {
          toast.success("Billing and payment details added successfully!");
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