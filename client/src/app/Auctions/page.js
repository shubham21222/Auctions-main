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
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";

export default function AuctionCalendar() {
  const [allAuctions, setAllAuctions] = useState([]); // Store all auctions from API
  const [displayedAuctions, setDisplayedAuctions] = useState([]); // Auctions to display on current page
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sortOption, setSortOption] = useState("date-desc");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 100000],
    searchQuery: "",
    auctionType: "",
    status: "ACTIVE",
    date: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [auctionsPerPage, setAuctionsPerPage] = useState(20);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const token = useSelector((state) => state.auth.token);
  const walletBalance = useSelector((state) =>
    state.auth.user?.walletBalance ? Number(state.auth.user.walletBalance) : 0
  );

  const { socket, liveAuctions, setLiveAuctions, joinAuction } = useSocket();

  const [joinedAuctions, setJoinedAuctions] = useState(new Set());

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `${token}` } : {};
      const queryParams = new URLSearchParams({
        ...(filters.category && { catalog: filters.category }),
        ...(filters.priceRange[1] !== 100000 && { priceRange: filters.priceRange[1] }),
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
        ...(filters.auctionType && { auctionType: filters.auctionType }),
        ...(filters.status && { status: filters.status }),
      }).toString();

      const url =       `${config.baseURL}/v1/api/auction/bulk${queryParams ? `?${queryParams}` : ""}`;
      const auctionsResponse = await fetch(url, {
        method: "GET",
        headers,
      });
      if (!auctionsResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionsData = await auctionsResponse.json();

      console.log("API Response:", auctionsData);

      if (auctionsData.status) {
        const auctionItems = auctionsData.items?.catalogs?.flatMap((catalog) =>
          catalog.auctions.map((auction) => ({
            ...auction,
            catalogName: catalog.catalogName,
            images: auction.product?.image || ["/placeholder.svg"],
          }))
        ) || [];

        console.log("Flattened Auction Items:", auctionItems);

        const enrichedAuctions = auctionItems.map((auction) => ({
          id: auction._id,
          title: auction.product?.title || "Untitled Auction",
          images: auction.images,
          endDateTime: auction.endDate || "N/A",
          endDateRaw: auction.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          startDateRaw: auction.startDate,
          currentBid: auction.currentBid,
          startingBid: auction.startingBid,
          status: auction.status,
          auctionType: auction.auctionType,
          lotNumber: auction.lotNumber,
          catalogName: auction.catalogName,
          featured: true,
          product: { _id: auction.product?._id || "" },
          winner: auction.winner ? auction.winner.name : null,
          currentBidder: auction.currentBidder,
          bids: auction.bids || [],
        }));

        console.log("Enriched Auctions:", enrichedAuctions);

        let filteredAuctions = filters.date
          ? enrichedAuctions.filter((auction) => {
              const startDate = new Date(auction.startDateRaw);
              return (
                startDate.getFullYear() === filters.date.getFullYear() &&
                startDate.getMonth() === filters.date.getMonth() &&
                startDate.getDate() === filters.date.getDate()
              );
            })
          : enrichedAuctions;

        console.log("Filtered Auctions:", filteredAuctions);

        filteredAuctions = [...filteredAuctions].sort((a, b) => {
          switch (sortOption) {
            case "title-asc":
              return a.title.localeCompare(b.title);
            case "title-desc":
              return b.title.localeCompare(a.title);
            case "price-asc":
              return a.currentBid - b.currentBid;
            case "price-desc":
              return b.currentBid - a.currentBid;
            case "date-asc":
              return new Date(a.startDateRaw) - new Date(b.startDateRaw);
            case "date-desc":
            default:
              return new Date(b.startDateRaw) - new Date(a.startDateRaw);
          }
        });

        console.log("Sorted Auctions:", filteredAuctions);

        setAllAuctions(filteredAuctions);
        setTotalAuctions(filteredAuctions.length); // Use the length of filtered auctions since backend doesn’t paginate
      } else {
        throw new Error(auctionsData.message);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAllAuctions([]);
      setDisplayedAuctions([]);
      setTotalAuctions(0);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * auctionsPerPage;
    const endIndex = startIndex + auctionsPerPage;
    const paginatedAuctions = allAuctions.slice(startIndex, endIndex);
    setDisplayedAuctions(paginatedAuctions);

    const liveAuctionsData = paginatedAuctions.filter(
      (auction) =>
        auction.status === "ACTIVE" &&
        new Date(auction.startDateRaw) <= new Date() &&
        new Date(auction.endDateRaw) > new Date()
    );
    setLiveAuctions(liveAuctionsData);

    liveAuctionsData.forEach((auction) => {
      if (!joinedAuctions.has(auction.id)) {
        joinAuction(auction.id);
        setJoinedAuctions((prev) => new Set(prev).add(auction.id));
        console.log(`Joined new live auction: ${auction.id}`);
      } else {
        console.log(`Already joined live auction: ${auction.id}`);
      }
    });
  }, [allAuctions, currentPage, auctionsPerPage, joinAuction]);

  // Fetch auctions when filters, sort, or token change, and log total pages
  useEffect(() => {
    fetchAuctions();
    console.log("Total Pages Calculated:", Math.ceil(totalAuctions / auctionsPerPage)); // Log only when dependencies change

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [token, filters, sortOption, totalAuctions, auctionsPerPage]); // Added totalAuctions and auctionsPerPage to dependencies

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setAuctionsPerPage(newPerPage);
    setCurrentPage(1); // Reset to page 1 when items per page changes
  };

  const totalPages = Math.ceil(totalAuctions / auctionsPerPage);

  const getPageNumbers = useCallback(() => {
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    console.log("Page Numbers Generated:", pages); // Log only when called
    return pages;
  }, [currentPage, totalPages]); // Memoize to prevent unnecessary recalculations

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
            Showing {displayedAuctions.length} of {totalAuctions} Exceptional Pieces
          </span>
          <div className="flex items-center gap-4">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[240px] border-luxury-gold/20 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="title-asc">By title (A-Z)</SelectItem>
                <SelectItem value="title-desc">By title (Z-A)</SelectItem>
                <SelectItem value="price-asc">By price (Low to High)</SelectItem>
                <SelectItem value="price-desc">By price (High to Low)</SelectItem>
                <SelectItem value="date-asc">By date (Oldest)</SelectItem>
                <SelectItem value="date-desc">By date (Newest)</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={auctionsPerPage.toString()}
              onValueChange={(value) => handlePerPageChange(Number(value))}
            >
              <SelectTrigger className="w-[120px] border-luxury-gold/20 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="30">30 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            ) : displayedAuctions.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No auctions available for the selected filters.
              </p>
            ) : (
              displayedAuctions.map((auction) => (
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

        {/* Pagination Controls with Numbers */}
        {totalAuctions > 0 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-luxury-gold text-white hover:bg-luxury-charcoal"
            >
              Previous
            </Button>

            {getPageNumbers().map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                className={`w-10 h-10 ${
                  currentPage === page
                    ? "bg-luxury-gold text-white hover:bg-luxury-charcoal"
                    : "border-luxury-gold/20 text-luxury-charcoal hover:bg-luxury-gold/10"
                }`}
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-luxury-gold text-white hover:bg-luxury-charcoal"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}