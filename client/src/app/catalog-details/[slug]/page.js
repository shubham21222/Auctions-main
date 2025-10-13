"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Image from "next/image";
import config from "@/app/config_BASE_URL";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import SignupModal from "@/app/components/SignupModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, Heart, ChevronRight } from "lucide-react";
import { AuctionFilters } from "../auction-filters";
import Link from "next/link";

export default function CatalogDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("lot-asc");
  const [viewOption, setViewOption] = useState("60");
  const [hoveredLot, setHoveredLot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    minPrice: 0,
    maxPrice: 5000,
    category: "",
    searchQuery: "",
    auctionType: "",
    status: "ACTIVE",
    date: null,
  });
  
  const auth = useSelector((state) => state.auth);
  const { token, user, isLoggedIn } = auth;

  useEffect(() => {
    const fetchCatalogDetails = async () => {
      setLoading(true); // Show loading when fetching new data
      try {
        const headers = token ? { Authorization: `${token}` } : {};
        
        // Build query params for filters and pagination
        const params = new URLSearchParams({
          page: currentPage,
          limit: viewOption,
          sortField: sortOption.includes('lot') ? 'lotNumber' : 'currentBid',
          sortOrder: sortOption.includes('asc') ? 'asc' : 'desc',
        });
        
        if (filters.minPrice > 0) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice < 5000) params.append('maxPrice', filters.maxPrice);
        if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
        if (filters.status) params.append('status', filters.status);
        if (filters.auctionType) params.append('auctionType', filters.auctionType);
        if (filters.date) params.append('date', filters.date);
        
        // 🔥 Use the new optimized endpoint - fetches only one catalog
        const response = await fetch(
          `${config.baseURL}/v1/api/auction/catalog/${slug}?${params.toString()}`,
          {
            method: "GET",
            headers,
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Failed to fetch catalog details: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Catalog API Response:", data); // Debug log

        if (data.status) {
          setCatalog({
            catalogName: data.items.catalogName,
            auctions: data.items.auctions || [],
            currentAuction: data.items.currentAuction,
            pagination: data.items.pagination,
          });
        } else {
          throw new Error(data.message || "Catalog not found");
        }
      } catch (error) {
        console.error("Error fetching catalog details:", error);
        toast.error(error.message || "Failed to load catalog details");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogDetails();
  }, [slug, token, currentPage, viewOption, sortOption, filters.minPrice, filters.maxPrice, filters.searchQuery, filters.status, filters.auctionType, filters.date]);

  // Countdown Timer Logic
  useEffect(() => {
    if (!catalog?.currentAuction?.startDate) return;

    const updateTimer = () => {
      const now = new Date();
      const startDate = new Date(catalog.currentAuction.startDate);
      const timeDiff = startDate - now;

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
  }, [catalog]);

  // Server handles filtering, sorting, and pagination now - just use the data
  const displayedAuctions = catalog?.auctions || [];
  const totalPages = catalog?.pagination?.totalPages || 1;
  const totalAuctions = catalog?.pagination?.total || 0;

  // Update page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleBidNow = (lotId, status) => {
    if (status === "ENDED") {
      toast.error("This auction has ended");
      return;
    }

    router.push(`/item/${lotId}`);
  };

  const handleCardClick = (lotId, status) => {
    if (status === "ENDED") {
      toast.error("This auction has ended");
      return;
    }
    router.push(`/item/${lotId}`);
  };

  const handleContextMenu = (e, lotId, status) => {
    e.preventDefault(); // Prevent default context menu
    
    // Create and show custom context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'fixed bg-white shadow-lg rounded-lg py-2 z-50';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    const menuItem = document.createElement('div');
    menuItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm';
    menuItem.textContent = 'Open in new tab';
    menuItem.onclick = () => {
      if (status === "ENDED") {
        toast.error("This auction has ended");
        return;
      }
      router.push(`/item/${lotId}`);
      document.body.removeChild(contextMenu);
    };
    
    contextMenu.appendChild(menuItem);
    document.body.appendChild(contextMenu);
    
    // Remove context menu when clicking outside
    const removeMenu = (e) => {
      if (!contextMenu.contains(e.target)) {
        document.body.removeChild(contextMenu);
        document.removeEventListener('click', removeMenu);
      }
    };
    
    document.addEventListener('click', removeMenu);
  };

  const handleRegisterAuction = () => {
    if (!isLoggedIn) {
      setIsSignupModalOpen(true);
    } else {
      toast.info("You are already registered for this auction.");
    }
  };

  const handleAddToCalendar = () => {
    if (!catalog?.currentAuction) return;

    const title = catalog.currentAuction.catalog;
    const description = catalog.currentAuction.description || "Join us for this exciting auction event.";
    const location = "Beverly Hills, CA, United States";
    
    // Format dates for Google Calendar
    const startDate = new Date(catalog.currentAuction.startDate);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
    
    const start = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    
    window.open(url, "_blank");
  };

  // Parse estimateprice
  const parseEstimatePrice = (estimate) => {
    if (!estimate || typeof estimate !== "string") return "N/A";
    const [min, max] = estimate.split("-").map((val) => parseFloat(val).toFixed(0));
    return `${min} - ${max}`;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // You can add additional filter logic here if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-luxury-charcoal">Catalog not found</p>
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
          <span>{catalog.currentAuction?.auctionHouse || "NY Elizabeth"}</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-luxury-charcoal">{catalog.currentAuction?.catalog}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg  shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-luxury-charcoal mb-6">Filters</h2>
              <AuctionFilters onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Catalog Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-luxury-charcoal mb-2">
                    {catalog.currentAuction?.catalog}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{catalog.currentAuction?.auctionHouse || "NY Elizabeth"}</span>
                    <span>•</span>
                    <MapPin className="h-4 w-4" />
                    <span>Beverly Hills, CA, United States</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>
                      Starts on: {new Date(catalog.currentAuction?.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {!isLoggedIn && (
                    <Button 
                      className="bg-luxury-gold text-white hover:bg-luxury-charcoal whitespace-nowrap"
                      onClick={handleRegisterAuction}
                    >
                      Register for Auction
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-luxury-gold text-luxury-gold whitespace-nowrap"
                    onClick={handleAddToCalendar}
                  >
                    Add To Calendar
                  </Button>
                </div>
              </div>
            </div>

            {/* Catalog Description */}
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-luxury-charcoal mb-4">
                Auction Details
              </h2>
              <p className="text-muted-foreground mb-6">
                {catalog.currentAuction?.description || "No description available"}
              </p>
            </div>

            {/* Filters and Item Count */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="text-sm text-gray-600">
                Showing {displayedAuctions.length} of {totalAuctions} lots
              </div>
              <div className="flex gap-4">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lot-asc">Lot Number: Lowest</SelectItem>
                    <SelectItem value="lot-desc">Lot Number: Highest</SelectItem>
                    <SelectItem value="price-asc">Price: Lowest</SelectItem>
                    <SelectItem value="price-desc">Price: Highest</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={viewOption} onValueChange={setViewOption}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 per page</SelectItem>
                    <SelectItem value="120">120 per page</SelectItem>
                    <SelectItem value="240">240 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              ) : displayedAuctions.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-gray-500">No auctions match your filters</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setFilters({
                      page: 1,
                      minPrice: 0,
                      maxPrice: 5000,
                      category: "",
                      searchQuery: "",
                      auctionType: "",
                      status: "ACTIVE",
                      date: null,
                    })}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                displayedAuctions.map((auction) => (
                  <Link
                    key={auction._id}
                    href={`/item/${auction._id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
                    onMouseEnter={() => setHoveredLot(auction._id)}
                    onMouseLeave={() => setHoveredLot(null)}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={auction.product?.image?.[0] || "/placeholder.svg"}
                        alt={auction.product?.title}
                        fill
                        className={`object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105 ${
                          hoveredLot === auction._id ? "opacity-0" : "opacity-100"
                        }`}
                      />
                      <Image
                        src={
                          auction.product?.image?.[1] ||
                          auction.product?.image?.[0] ||
                          "/placeholder.svg"
                        }
                        alt={auction.product?.title}
                        fill
                        className={`object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105 ${
                          hoveredLot === auction._id ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-transform duration-300"
                          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to card
                        >
                          <Heart className="h-4 w-4 text-luxury-gold hover:fill-luxury-gold transition-colors duration-300" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-luxury-gold/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          Lot {auction.lotNumber}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-luxury-charcoal mb-2 line-clamp-2 group-hover:text-luxury-gold transition-colors duration-300">
                        {auction.product?.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-luxury-gold">
                              Estimated Price
                            </p>
                            <p className="text-sm font-semibold">
                              ${parseEstimatePrice(auction.product?.estimateprice)}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs font-medium text-gray-500">
                              Current Bid
                            </p>
                            <p className="text-sm font-semibold text-luxury-charcoal">
                              ${Number(auction.currentBid).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Button
                          className={`w-full rounded-lg py-2 transition-all duration-300 ${
                            auction.status === "ENDED"
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-luxury-gold text-white hover:bg-luxury-charcoal hover:shadow-lg hover:shadow-luxury-gold/20"
                          }`}
                          disabled={auction.status === "ENDED"}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent click from bubbling to card
                            handleBidNow(auction._id, auction.status);
                          }}
                        >
                          {auction.status === "ENDED" ? "Auction Ended" : "Bid Now"}
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-luxury-gold text-white hover:bg-luxury-charcoal disabled:opacity-50"
                >
                  Previous
                </Button>
                
                {/* Smart Pagination - Show first, last, and pages around current */}
                {currentPage > 2 && (
                  <>
                    <Button
                      onClick={() => handlePageChange(1)}
                      variant="outline"
                      className="w-8 h-8 border-luxury-gold/20 text-luxury-charcoal hover:bg-luxury-gold/10"
                    >
                      1
                    </Button>
                    {currentPage > 3 && <span className="px-2">...</span>}
                  </>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`w-8 h-8 ${
                        currentPage === page
                          ? "bg-luxury-gold text-white hover:bg-luxury-charcoal"
                          : "border-luxury-gold/20 text-luxury-charcoal hover:bg-luxury-gold/10"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                    <Button
                      onClick={() => handlePageChange(totalPages)}
                      variant="outline"
                      className="w-8 h-8 border-luxury-gold/20 text-luxury-charcoal hover:bg-luxury-gold/10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-luxury-gold text-white hover:bg-luxury-charcoal disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenLogin={() => {
          setIsSignupModalOpen(false);
        }}
      />
      <Footer />
    </>
  );
}