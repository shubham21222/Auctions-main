"use client";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuctionCard } from "./components/auction-card";
import { AuctionFilters } from "./components/auction-filters";
import { LuxuryBackground } from "./components/luxury-background";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import { useSocket } from "@/hooks/useSocket";

export default function AuctionCalendar() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 100000],
    searchQuery: "",
    auctionType: "",
    status: "ACTIVE", // Default to ACTIVE
    date: null,
  });

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const token = useSelector((state) => state.auth.token);
  const walletBalance = useSelector((state) =>
    state.auth.user?.walletBalance ? Number(state.auth.user.walletBalance) : 0
  );

  const { socket, liveAuctions, setLiveAuctions, joinAuction } = useSocket();

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `${token}` } : {};
      const queryParams = new URLSearchParams({
        ...(filters.category && { category: filters.category }),
        ...(filters.priceRange[1] !== 100000 && { priceRange: filters.priceRange[1] }),
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
        ...(filters.auctionType && { auctionType: filters.auctionType }),
        ...(filters.status && { status: filters.status }), // Use status from filters
        page: 1,
        limit: 10,
      }).toString();

      const url = `${config.baseURL}/v1/api/auction/all${queryParams ? `?${queryParams}` : ""}`;
      const auctionsResponse = await fetch(url, {
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
              const productResponse = await fetch(
                `${config.baseURL}/v1/api/product/${auction.product._id}`,
                { method: "GET", headers }
              );
              if (!productResponse.ok)
                throw new Error(`Failed to fetch product ${auction.product._id}`);
              const productData = await productResponse.json();

              return {
                id: auction._id,
                title: auction.product.title,
                images: productData.items?.image || ["/placeholder.svg"],
                endDateTime: auction.endDateFormatted,
                endDateRaw: auction.endDate,
                startDateRaw: auction.startDate,
                currentBid: auction.currentBid,
                startingBid: auction.startingBid,
                status: auction.status,
                auctionType: auction.auctionType,
                lotNumber: auction.lotNumber,
                featured: true,
                product: { _id: auction.product._id },
                winner: auction.winner ? auction.winner.name : null,
                currentBidder: auction.currentBidder,
                bids: auction.bids || [],
              };
            } catch (error) {
              console.error(`Error fetching product for auction ${auction._id}:`, error);
              return {
                id: auction._id,
                title: auction.product.title,
                images: ["/placeholder.svg"],
                endDateTime: auction.endDateFormatted,
                endDateRaw: auction.endDate,
                startDateRaw: auction.startDate,
                currentBid: auction.currentBid,
                startingBid: auction.startingBid,
                status: auction.status,
                auctionType: auction.auctionType,
                lotNumber: auction.lotNumber,
                featured: true,
                product: { _id: auction.product._id },
                winner: auction.winner ? auction.winner.name : null,
                currentBidder: auction.currentBidder,
                bids: auction.bids || [],
              };
            }
          })
        );

        // Apply date filter locally if set
        const filteredAuctions = filters.date
          ? enrichedAuctions.filter((auction) => {
            const startDate = new Date(auction.startDateRaw);
            return (
              startDate.getFullYear() === filters.date.getFullYear() &&
              startDate.getMonth() === filters.date.getMonth() &&
              startDate.getDate() === filters.date.getDate()
            );
          })
          : enrichedAuctions;

        setAuctions(filteredAuctions);

        // Sync live auctions with socket
        const liveAuctionsData = filteredAuctions.filter(
          (auction) =>
            auction.status === "ACTIVE" &&
            new Date(auction.startDateRaw) <= new Date() &&
            new Date(auction.endDateRaw) > new Date()
        );
        setLiveAuctions(liveAuctionsData);
        liveAuctionsData.forEach((auction) => joinAuction(auction.id));

        // toast.success("Auctions loaded successfully!");
      } else {
        throw new Error(auctionsData.message);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      setLiveAuctions([]);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [token, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

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
      {/* <LuxuryBackground /> */}
      <div className="container relative mx-auto px-4 mt-[40px] py-12">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
            <Sparkles className="h-4 w-4" />
            <span>LUXURY AUCTIONS</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-luxury-charcoal">
            Auction Calendar
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Discover extraordinary pieces from the world’s most prestigious collections. Each auction is carefully
            curated to bring you the finest in luxury.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {auctions.length} Exceptional Pieces
          </span>
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
            <AuctionFilters onFilterChange={handleFilterChange} />
          </aside>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 auto-rows-min">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : auctions.length === 0 ? (
              <p>No active auctions available.</p>
            ) : (
              auctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  walletBalance={walletBalance}
                  currentTime={currentTime}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}