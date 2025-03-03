"use client";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuctionCard } from "./components/auction-card";
import { AuctionFilters } from "./components/auction-filters";
import { LuxuryBackground } from "./components/luxury-background";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function AuctionCalendar() {
  const [auctions, setAuctions] = useState([]);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const token = useSelector((state) => state.auth.token);

  const handleCloseInfoBox = () => {
    setShowInfoBox(false);
  };

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      // Fetch all auctions
      const auctionsResponse = await fetch(`${config.baseURL}/v1/api/auction/all`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!auctionsResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionsData = await auctionsResponse.json();

      if (auctionsData.status) {
        const auctionItems = Array.isArray(auctionsData.items) ? auctionsData.items : [];
        
        // Fetch product details for each auction
        const enrichedAuctions = await Promise.all(
          auctionItems.map(async (auction) => {
            try {
              const productResponse = await fetch(`${config.baseURL}/v1/api/product/${auction.product._id}`, {
                method: "GET",
                headers: {
                  Authorization: `${token}`,
                },
              });
              if (!productResponse.ok) throw new Error(`Failed to fetch product ${auction.product._id}`);
              const productData = await productResponse.json();

              return {
                id: auction._id,
                title: auction.product.title,
                images: productData.items?.image || ["/placeholder.svg"], // Fetch images from product API
                endDate: new Date(auction.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                endTime: new Date(auction.endDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                }),
                currentBid: auction.currentBid,
                status: auction.status,
                featured: true,
              };
            } catch (error) {
              console.error(`Error fetching product for auction ${auction._id}:`, error);
              // Fallback to auction data if product fetch fails
              return {
                id: auction._id,
                title: auction.product.title,
                images: ["/placeholder.svg"], // Fallback image
                endDate: new Date(auction.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                endTime: new Date(auction.endDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                }),
                currentBid: auction.currentBid,
                status: auction.status,
                featured: true,
              };
            }
          })
        );

        setAuctions(enrichedAuctions);
        toast.success("Auctions loaded successfully!");
      } else {
        throw new Error(auctionsData.message);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAuctions();
    }
  }, [token]);

  const handlePaymentClick = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to make a payment.");
      return;
    }

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Payment service unavailable. Please try again later.");
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 10000,
          description: "Auction Participation Fee",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const session = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        toast.error("Error redirecting to payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error.message);
      // toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <LuxuryBackground />
      <div className="container relative mx-auto px-4 mt-[40px] py-12">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
            <Sparkles className="h-4 w-4" />
            <span>LUXURY AUCTIONS</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-luxury-charcoal">Auction Calendar</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Discover extraordinary pieces from the world’s most prestigious collections. Each auction is carefully
            curated to bring you the finest in luxury.
          </p>
        </div>

        {showInfoBox && (
          <div className="mt-6 mx-auto max-w-[1500px] bg-blue-500 rounded-[20px] text-white p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative">
            <p className="text-sm font-medium">
              To participate in an auction, pay a fee of <span className="font-bold">$100</span>.
            </p>
            <button
              onClick={handlePaymentClick}
              className="btn bg-luxury-gold text-black mr-6 px-4 py-2 rounded-md font-semibold hover:bg-luxury-gold/80 transition-colors"
            >
              Make a Payment
            </button>
            <button
              onClick={handleCloseInfoBox}
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
              aria-label="Close info box"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Showing {auctions.length} Exceptional Pieces</span>
          <Select>
            <SelectTrigger className="w-[240px] border-luxury-gold/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">By title (A-Z)</SelectItem>
              <SelectItem value="title-desc">By title (Z-A)</SelectItem>
              <SelectItem value="price-asc">By price (Low to High)</SelectItem>
              <SelectItem value="price-desc">By price (High to Low)</SelectItem>
              <SelectItem value="date-asc">By date (Newest)</SelectItem>
              <SelectItem value="date-desc">By date (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-xl border border-luxury-gold/20 bg-white/80 p-6 backdrop-blur-sm">
            <AuctionFilters />
          </aside>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <p>Loading auctions...</p>
            ) : auctions.length === 0 ? (
              <p>No auctions available.</p>
            ) : (
              auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}