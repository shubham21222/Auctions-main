"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Heart, ChevronRight, ChevronLeft, ZoomIn } from "lucide-react";
import config from "@/app/config_BASE_URL";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import toast from "react-hot-toast";
import LoginModal from "@/app/components/LoginModal";
import { VerificationModal } from "@/app/components/VerificationModal";
import BillingPaymentModal from "@/app/components/BillingPaymentModal";

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isBillingPaymentModalOpen, setIsBillingPaymentModalOpen] = useState(false);
  
  const auth = useSelector((state) => state.auth);
  const { token, user, isLoggedIn } = auth;

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulkgetbyId/${id}`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch item details");
        const data = await response.json();

        if (data.status && data.items) {
          setItem(data.items);
        } else {
          throw new Error("Invalid item data");
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        toast.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, token]);

  // Countdown Timer Logic
  useEffect(() => {
    if (!item?.endDate) return;

    const updateTimer = () => {
      const now = new Date();
      const endDate = new Date(item.endDate);
      const timeDiff = endDate - now;

      if (timeDiff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const nextImage = () => {
    if (item?.product?.image?.length) {
      setCurrentImage((prev) => (prev + 1) % item.product.image.length);
    }
  };

  const prevImage = () => {
    if (item?.product?.image?.length) {
      setCurrentImage((prev) => (prev - 1 + item.product.image.length) % item.product.image.length);
    }
  };

  const handlePlaceBid = () => {
    // Check 1: Login Check
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    // Check 2: Email Verification Check
    if (!user?.isEmailVerified) {
      setIsVerificationModalOpen(true);
      return;
    }

    // Check 3: Billing and Payment Method Check
    const hasBillingDetails = user?.BillingDetails?.length > 0 || auth?.billingDetails;
    const hasPaymentMethod = user?.paymentMethodId || auth?.paymentMethodId;

    if (!hasBillingDetails || !hasPaymentMethod) {
      setIsBillingPaymentModalOpen(true);
      return;
    }

    // If all checks pass, open catalog in new window
    window.open(
      `/catalog/${id}`,
      "_blank",
      "width=1400,height=800,left=100,top=100,scrollbars=yes,resizable=yes"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-luxury-charcoal">Item not found</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 mt-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <span>Online Auctions</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>{item.auctionHouse || "NY Elizabeth"}</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-luxury-charcoal">Lot {item.lotNumber}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery with Carousel */}
          <div className="space-y-4">
            <div className="flex gap-4">
              {/* Thumbnails */}
              {item.product?.image?.length > 1 && (
                <div className="flex flex-col gap-2">
                  {item.product.image.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`relative w-20 aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                        currentImage === index
                          ? "ring-2 ring-luxury-gold scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${item.product?.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1 aspect-square rounded-lg overflow-hidden group">
                <Image
                  src={item.product?.image?.[currentImage] || "/placeholder.svg"}
                  alt={item.product?.title}
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-300"
                  >
                    <ChevronLeft className="h-6 w-6 text-luxury-charcoal" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-300"
                  >
                    <ChevronRight className="h-6 w-6 text-luxury-charcoal" />
                  </button>
                </div>
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-300"
                >
                  <ZoomIn className="h-6 w-6 text-luxury-charcoal" />
                </button>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-luxury-charcoal mb-2">
                {item.product?.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Lot {item.lotNumber}</span>
                <span>•</span>
                <MapPin className="h-4 w-4" />
                <span>Beverly Hills, CA, United States</span>
              </div>
            </div>

            {/* Countdown Timer */}
            {/* <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-luxury-charcoal mb-4">
                Time Remaining:
              </h3>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-luxury-gold">
                    {timeRemaining.days}
                  </div>
                  <div className="text-sm text-muted-foreground">days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-luxury-gold">
                    {timeRemaining.hours}
                  </div>
                  <div className="text-sm text-muted-foreground">hrs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-luxury-gold">
                    {timeRemaining.minutes}
                  </div>
                  <div className="text-sm text-muted-foreground">mins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-luxury-gold">
                    {timeRemaining.seconds}
                  </div>
                  <div className="text-sm text-muted-foreground">secs</div>
                </div>
              </div>
            </div> */}

            {/* Price Information */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Bid</h3>
                  <p className="text-2xl font-bold text-luxury-gold">
                    ${Number(item.currentBid).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Estimated Price</h3>
                  <p className="text-lg font-semibold">
                    ${item.product?.estimateprice || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-luxury-charcoal mb-2">Description</h3>
              <div 
                className="text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: item.product?.description || "No description available" 
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button 
                className="bg-luxury-gold text-white hover:bg-luxury-charcoal transition-colors duration-300"
                onClick={handlePlaceBid}
              >
                Place Bid
              </Button>
              {/* <Button
                variant="outline"
                className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 transition-colors duration-300"
              >
                <Heart className="h-4 w-4 mr-2" /> Add to Watchlist
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignup={() => {
          setIsLoginModalOpen(false);
          toast.info("Please implement the signup modal logic.");
        }}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        email={user?.email}
      />

      <BillingPaymentModal
        isOpen={isBillingPaymentModalOpen}
        onClose={() => setIsBillingPaymentModalOpen(false)}
        onSuccess={() => {
          toast.success("Billing and payment details added successfully!");
          window.open(
            `/catalog/${id}`,
            "_blank",
            "width=1400,height=800,left=100,top=100,scrollbars=yes,resizable=yes"
          );
        }}
        token={token}
        email={user?.email}
      />
      <Footer />
    </>
  );
} 