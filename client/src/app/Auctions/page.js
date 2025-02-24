"use client";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuctionCard } from "./components/auction-card";
import { AuctionFilters } from "./components/auction-filters";
import { LuxuryBackground } from "./components/luxury-background";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import toast from "react-hot-toast"; // Import react-hot-toast for notifications

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Enhanced sample data
const auctions = [
  {
    id: "2561",
    title: "Hermès Birkin Handbags Collection",
    images: [
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product86c9a806c273e359c2dad3a6a774089b.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productbc9f3bcb07b6d68f74e100dba8b1fefe.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product517689e196639046ded814db7a5eca29.webp",
    ],
    endDate: "Feb 1, 2025",
    endTime: "7:00 PM GMT-08:00",
    currentBid: 55000,
    featured: true,
  },
  {
    id: "2562",
    title: "Fine Jewelry Collection",
    images: [
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productf0cc116dd0ca1729dcaf90f1aee103e8.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/c1-300x300.webp",
    ],
    endDate: "Feb 1, 2025",
    endTime: "9:00 AM GMT-08:00",
    currentBid: 125000,
    featured: true,
  },
];

export default function AuctionCalendar() {
  const [showInfoBox, setShowInfoBox] = useState(true);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Get login status from Redux

  const handleCloseInfoBox = () => {
    setShowInfoBox(false);
  };

  const handlePaymentClick = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast.error("Please login to make a payment."); // Show toast if not logged in
      return;
    }

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load");
        toast.error("Payment service unavailable. Please try again later.");
        return;
      }

      // Fetch the Checkout Session from your API
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 10000, // $100 in cents
          description: "Auction Participation Fee",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const session = await response.json();

      // Redirect to Stripe Checkout using the session ID
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error("Stripe Checkout error:", error.message);
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

        {/* Blue Info Box with X Icon */}
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
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}