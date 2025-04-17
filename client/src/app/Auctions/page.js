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
import { Button } from "@/components/ui/button";

export default function AuctionCalendar() {
  const [allAuctions, setAllAuctions] = useState([]);
  const [displayedAuctions, setDisplayedAuctions] = useState([]);
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

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `${token}` } : {};
      const queryParams = new URLSearchParams({
        page: currentPage,
        ...(filters.category && { catalog: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
        ...(filters.auctionType && { auctionType: filters.auctionType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date && { Date: filters.date }),
      }).toString();

      const url = `${config.baseURL}/v1/api/auction/bulk${queryParams ? `?${queryParams}` : ""}`;
      console.log("API URL:", url); // Add this for debugging
      const auctionsResponse = await fetch(url, {
        method: "GET",
        headers,
      });
      if (!auctionsResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionsData = await auctionsResponse.json();

      if (auctionsData.status) {
        const auctionItems = auctionsData.items?.catalogs?.flatMap((catalog) =>
          catalog.auctions.map((auction) => ({
            ...auction,
            catalogName: catalog.catalogName,
            images: auction.product?.image || ["/placeholder.svg"],
          }))
        ) || [];

        let enrichedAuctions = auctionItems.map((auction) => ({
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

        // Apply date filter if date is provided
        if (filters.date) {
          const filterDate = new Date(filters.date);
          filterDate.setHours(0, 0, 0, 0); // Set to start of day

          enrichedAuctions = enrichedAuctions.filter((auction) => {
            if (!auction.startDateRaw) return false;
            const auctionDate = new Date(auction.startDateRaw);
            auctionDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
            return auctionDate.toDateString() === filterDate.toDateString();
          });
        }

        enrichedAuctions = [...enrichedAuctions].sort((a, b) => {
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

        setAllAuctions(enrichedAuctions);
        setTotalAuctions(enrichedAuctions.length);
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
  }, [allAuctions, currentPage, auctionsPerPage]);

  useEffect(() => {
    let isSubscribed = true;
    let timeoutId;

    const fetchData = async () => {
      if (!isSubscribed) return;
      setLoading(true);
      try {
        await fetchAuctions();
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    // Debounce the fetch to prevent rapid re-fetches
    timeoutId = setTimeout(fetchData, 300);

    const timeInterval = setInterval(() => {
      if (isSubscribed) {
        setCurrentTime(new Date());
      }
    }, 1000);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      clearInterval(timeInterval);
    };
  }, [token, filters, sortOption]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setAuctionsPerPage(newPerPage);
    setCurrentPage(1);
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
    return pages;
  }, [currentPage, totalPages]);

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
      <div className="container relative mx-auto px-4 mt-[40px] py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
            <Sparkles className="h-4 w-4" />
            <span>LUXURY AUCTIONS</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-luxury-charcoal">
            Auction Calendar
          </h1>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground px-4">
            Discover extraordinary pieces from the world&apos;s most prestigious collections. Each auction is carefully
            curated to bring you the finest in luxury.
          </p>
        </div>  

        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {displayedAuctions.length} of {totalAuctions} Exceptional Pieces
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full sm:w-[240px] border-luxury-gold/20 bg-white/80 backdrop-blur-sm">
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
              <SelectTrigger className="w-full sm:w-[120px] border-luxury-gold/20 bg-white/80 backdrop-blur-sm">
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

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-xl border border-luxury-gold/20 bg-white/80 p-4 md:p-6 backdrop-blur-sm">
            <AuctionFilters onFilterChange={handleFilterChange} />
          </aside>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 auto-rows-min">
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

        {totalAuctions > 0 && (
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
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
                className={`w-8 h-8 sm:w-10 sm:h-10 ${
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