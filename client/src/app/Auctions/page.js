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
  const [currentTime, setCurrentTime] = useState(new Date()); 
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const token = useSelector((state) => state.auth.token);
  const walletBalance = useSelector((state) =>
    state.auth.user?.walletBalance ? Number(state.auth.user.walletBalance) : 0
  );

  const handleCloseInfoBox = () => {
    setShowInfoBox(false);
  };

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `${token}` } : {};
      const auctionsResponse = await fetch(`${config.baseURL}/v1/api/auction/all`, {
        method: "GET",
        headers,
      });
      if (!auctionsResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionsData = await auctionsResponse.json();

      if (auctionsData.status) {
        const auctionItems = Array.isArray(auctionsData.items?.formattedAuctions)
          ? auctionsData.items.formattedAuctions
          : [];

        const enrichedAuctions = await Promise.all(
          auctionItems.map(async (auction) => {
            try {
              const productResponse = await fetch(`${config.baseURL}/v1/api/product/${auction.product._id}`, {
                method: "GET",
                headers,
              });
              if (!productResponse.ok) throw new Error(`Failed to fetch product ${auction.product._id}`);
              const productData = await productResponse.json();

              return {
                id: auction._id,
                title: auction.product.title,
                images: productData.items?.image || ["/placeholder.svg"],
                endDateTime: auction.endDateFormatted,
                endDateRaw: auction.endDate,
                currentBid: auction.currentBid,
                status: auction.status,
                featured: true,
                product: {
                  _id: auction.product._id,
                },
                winner: auction.winner ? auction.winner.name : null,
              };
            } catch (error) {
              console.error(`Error fetching product for auction ${auction._id}:`, error);
              return {
                id: auction._id,
                title: auction.product.title,
                images: ["/placeholder.svg"],
                endDateTime: auction.endDateFormatted,
                endDateRaw: auction.endDate,
                currentBid: auction.currentBid,
                status: auction.status,
                featured: true,
                product: {
                  _id: auction.product._id,
                },
                winner: auction.winner ? auction.winner.name : null,
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
    fetchAuctions();

    // Update current time every second for real-time end check
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refresh auction data every 60 seconds
    const fetchInterval = setInterval(() => {
      fetchAuctions();
    }, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(fetchInterval);
    };
  }, []);

  const SkeletonCard = () => (
    <div className="group relative overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm rounded-lg">
      <div className="relative aspect-[4/3] bg-gray-200 animate-shimmer" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-shimmer" />
      </div>
      <div className="p-6 pt-0">
        <div className="h-10 bg-gray-200 rounded w-full animate-shimmer" />
      </div>
    </div>
  );

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
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : auctions.length === 0 ? (
              <p>No auctions available.</p>
            ) : (
              auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} walletBalance={walletBalance} currentTime={currentTime} />
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  function handlePaymentClick() {
    if (!isLoggedIn) {
      toast.error("Please login to make a payment.");
      return;
    }

    stripePromise.then((stripe) => {
      if (!stripe) {
        toast.error("Payment service unavailable. Please try again later.");
        return;
      }

      fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 10000,
          description: "Auction Participation Fee",
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.error || "Failed to create checkout session");
            });
          }
          return response.json();
        })
        .then((session) => stripe.redirectToCheckout({ sessionId: session.id }))
        .catch((error) => {
          console.error("Payment initiation error:", error.message);
          toast.error("Error redirecting to payment. Please try again.");
        });
    });
  }
}