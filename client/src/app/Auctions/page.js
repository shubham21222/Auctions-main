"use client";

import Footer from "../components/Footer";
import Header from "../components/Header";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CatalogCard({
  catalog,
  isUpcoming = false,
  isLive = false,
  timeRemaining = null,
}) {
  const router = useRouter();
  const firstAuction = catalog.auctions[0];
  const secondAuction = catalog.auctions[1];
  const thirdAuction = catalog.auctions[2];

  const images = [
    firstAuction?.product?.image?.[0] || "/placeholder.svg",
    secondAuction?.product?.image?.[0] || "/placeholder.svg",
    thirdAuction?.product?.image?.[0] || "/placeholder.svg",
  ];

  const [currentMainImage, setCurrentMainImage] = useState(0);
  const auctionCount = catalog.auctions.length;

  const handleViewCatalog = (e) => {
    // Use Next.js router for navigation
    router.push(`/catalog-details/${firstAuction._id}`);
  };

  const handleThumbnailClick = (e, index) => {
    e.stopPropagation(); // Prevent card click when clicking thumbnails
    setCurrentMainImage(index);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentMainImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentMainImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Format date for display
  const auctionDate = firstAuction?.startDate
    ? (() => {
        const date = new Date(firstAuction.startDate);
        // Convert to PST
        const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const month = pstDate.toLocaleString('en-US', { month: 'long' });
        const day = pstDate.getDate();
        const year = pstDate.getFullYear();
        const time = pstDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'America/Los_Angeles'
        });
        const ordinal = (day) => {
          if (day > 3 && day < 21) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
        return `${month} ${day}${ordinal(day)}, ${year}, at ${time} PST`;
      })()
    : "Date TBD";

  const upcomingMessageDate = firstAuction?.startDate
    ? (() => {
        const date = new Date(firstAuction.startDate);
        // Convert to PST
        const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const month = pstDate.toLocaleString('en-US', { month: 'long' });
        const day = pstDate.getDate();
        const year = pstDate.getFullYear();
        const time = pstDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'America/Los_Angeles'
        });
        const ordinal = (day) => {
          if (day > 3 && day < 21) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
        return `${month} ${day}${ordinal(day)}, ${year}, at ${time} PST`;
      })()
    : "TBD";

  const isCatalogUpcoming =
    !isLive && !isUpcoming && firstAuction?.startDate
      ? new Date(firstAuction.startDate) > new Date()
      : false;

  return (
    <Link
      href={`/catalog-details/${firstAuction._id}`}
      className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-xl p-6 flex flex-row gap-10 items-start 
                    shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] 
                    transition-all duration-500 ease-out hover:-translate-y-1 border border-gray-100/20
                    hover:border-luxury-gold/20 cursor-pointer"
    >
      {/* Left: Main Image with Thumbnails */}
      <div className="flex-shrink-0 w-[450px] relative group/images">
        <div className="flex gap-4">
          {/* Thumbnails on left */}
          <div className="flex flex-col gap-4 w-[120px]">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={(e) => handleThumbnailClick(e, index)}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-50
                            hover:ring-2 ring-luxury-gold/50 transition-all duration-300
                            cursor-pointer transform hover:scale-95 active:scale-90
                            shadow-sm hover:shadow-md ${currentMainImage === index ? 'ring-2 ring-luxury-gold' : ''}`}
              >
                <img
                  src={image}
                  alt={`${catalog.catalogName} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300
                           hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-300" />
              </div>
            ))}
          </div>

          {/* Main Image with Carousel Controls */}
          <div className="flex-1 relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-50 shadow-md">
            <div className="relative w-full h-full">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${catalog.catalogName} - Main Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out
                           ${currentMainImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                />
              ))}
            </div>
            
            {/* Carousel Controls */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full
                       opacity-0 group-hover/images:opacity-100 transition-opacity duration-300
                       hover:bg-black/70 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full
                       opacity-0 group-hover/images:opacity-100 transition-opacity duration-300
                       hover:bg-black/70 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
              {currentMainImage + 1} / {images.length}
            </div>

            {/* Premium Badge */}
            {/* <div className="absolute top-4 right-4 bg-luxury-gold/90 text-white px-3 py-1 rounded-full text-sm font-medium
                          transform -rotate-12 shadow-lg">
              Premium
            </div> */}
          </div>
        </div>

        {/* Hover Overlay */}
        <div
          className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-white/95 to-transparent 
                     opacity-0 group-hover/images:opacity-100 transition-opacity duration-300"
        />
      </div>

      {/* Middle: Content with enhanced typography and animations */}
      <div className="flex-1 py-3 relative">
        <h3
          className="text-3xl font-semibold text-gray-800 mb-4 transition-all duration-300 
                     group-hover:text-luxury-gold group-hover:translate-x-1"
        >
          {catalog.catalogName}
        </h3>
        <p
          className="text-gray-600 text-base mb-6 line-clamp-2 transition-all duration-300 
                    group-hover:text-gray-700"
        >
          Join us for Catalog {catalog.catalogName}, an exclusive auction featuring a
          curated collection of fine items from renowned designers...
        </p>
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center gap-3 text-sm text-gray-500 transition-all duration-300 group-hover:translate-x-1">
            <svg
              className="w-5 h-5 text-luxury-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="group-hover:text-gray-700 transition-colors duration-300">
              Starts on: {auctionDate}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 transition-all duration-300 group-hover:translate-x-1">
            <svg
              className="w-5 h-5 text-luxury-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="group-hover:text-gray-700 transition-colors duration-300">
              Beverly Hills, CA, US
            </span>
          </div>
          {isLive ? (
            <div className="flex items-center gap-3 text-sm font-medium text-green-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Live Now</span>
            </div>
          ) : isUpcoming || isCatalogUpcoming ? (
            <div className="flex items-center gap-3 text-sm font-medium text-green-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Auction Date: {upcomingMessageDate}
                {timeRemaining && (
                  <>
                    <br />
                    Starts in: {timeRemaining.days}d {timeRemaining.hours}h{" "}
                    {timeRemaining.minutes}m {timeRemaining.seconds}s
                  </>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Scheduled</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Action with enhanced button effects */}
      <div className="flex-shrink-0 pt-3">
        <div
          className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white 
                   transition duration-300 ease-out border-2 border-[#006D7E] rounded-lg shadow-md group/btn
                   hover:shadow-lg hover:shadow-luxury-gold/20"
        >
          <span
            className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full 
                        bg-[#006D7E] group-hover/btn:translate-x-0 ease"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
          <span
            className="absolute flex items-center justify-center w-full h-full text-[#006D7E] transition-all 
                        duration-300 transform group-hover/btn:translate-x-full ease"
          >
            {isLive ? "Bid Now" : "Explore"}
          </span>
          <span className="relative invisible">
            {isLive ? "Bid Now" : "Explore"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AuctionCalendar() {
  const [catalogs, setCatalogs] = useState([]);
  const [upcomingCatalogs, setUpcomingCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [sortOption, setSortOption] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [catalogsPerPage, setCatalogsPerPage] = useState(20);
  const [totalCatalogs, setTotalCatalogs] = useState(0);
  const [timers, setTimers] = useState({});

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const token = useSelector((state) => state.auth.token);

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `${token}` } : {};
      // Ensure the URL is properly formatted
      const baseUrl = config.baseURL.replace(/\/$/, ''); // Remove trailing slash if present
      const url = `${baseUrl}/v1/api/auction/bulk`;
      
      console.log('Fetching catalogs from:', url); // Debug log
      
      const response = await fetch(url, {
        method: "GET",
        headers,
        redirect: 'follow', // Explicitly follow redirects
      });
      
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch catalogs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (data.status) {
        let fetchedCatalogs = data.items?.catalogs || [];

        // Sort catalogs based on sortOption
        fetchedCatalogs = [...fetchedCatalogs].sort((a, b) => {
          switch (sortOption) {
            case "name-asc":
              return a.catalogName.localeCompare(b.catalogName);
            case "name-desc":
              return b.catalogName.localeCompare(a.catalogName);
            case "items-asc":
              return a.auctions.length - b.auctions.length;
            case "items-desc":
              return b.auctions.length - a.auctions.length;
            default:
              return 0;
          }
        });

        setCatalogs(fetchedCatalogs);
        setTotalCatalogs(fetchedCatalogs.length);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching catalogs:", error);
      setCatalogs([]);
      toast.error("Failed to load catalogs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingCatalogs = async () => {
    setUpcomingLoading(true);
    try {
      const headers = token ? { Authorization: `${token}` } : {};
      // Ensure the URL is properly formatted
      const baseUrl = config.baseURL.replace(/\/$/, ''); // Remove trailing slash if present
      const url = `${baseUrl}/v1/api/auction/bulk?status=ACTIVE&page=1&limit=5000&upcoming=true`;
      
      console.log('Fetching upcoming catalogs from:', url); // Debug log
      
      const response = await fetch(url, {
        method: "GET",
        headers,
        redirect: 'follow', // Explicitly follow redirects
      });
      
      console.log('Upcoming Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch upcoming catalogs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Upcoming API Response:', data); // Debug log

      if (data.status) {
        setUpcomingCatalogs(data.items?.catalogs || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching upcoming catalogs:", error);
      setUpcomingCatalogs([]);
      toast.error("Failed to load upcoming catalogs.");
    } finally {
      setUpcomingLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
    fetchUpcomingCatalogs();
  }, [token, sortOption]);

  useEffect(() => {
    const updateTimers = () => {
      const newTimers = {};
      upcomingCatalogs.forEach((catalog) => {
        const startDate = catalog.auctions[0]?.startDate;
        if (!startDate) {
          newTimers[catalog.catalogName] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
          return;
        }

        const now = new Date();
        const start = new Date(startDate);
        const timeDiff = start - now;

        if (timeDiff <= 0) {
          newTimers[catalog.catalogName] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          newTimers[catalog.catalogName] = { days, hours, minutes, seconds };
        }
      });
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [upcomingCatalogs]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setCatalogsPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Filter live and upcoming catalogs
  const liveCatalogs = upcomingCatalogs.filter((catalog) => {
    const startDate = catalog.auctions[0]?.startDate;
    if (!startDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    return start <= now;
  });

  const upcomingCatalogsFiltered = upcomingCatalogs.filter((catalog) => {
    const startDate = catalog.auctions[0]?.startDate;
    if (!startDate) return true;
    const now = new Date();
    const start = new Date(startDate);
    return start > now;
  });

  // Filter catalogs to exclude those in live or upcoming sections to avoid duplicates
  const displayedCatalogs = catalogs
    .filter((catalog) => {
      const isInLive = liveCatalogs.some(
        (live) => live.catalogName === catalog.catalogName
      );
      const isInUpcoming = upcomingCatalogsFiltered.some(
        (upcoming) => upcoming.catalogName === catalog.catalogName
      );
      return !isInLive && !isInUpcoming;
    })
    .slice((currentPage - 1) * catalogsPerPage, currentPage * catalogsPerPage);

  const totalPages = Math.ceil(
    catalogs.filter((catalog) => {
      const isInLive = liveCatalogs.some(
        (live) => live.catalogName === catalog.catalogName
      );
      const isInUpcoming = upcomingCatalogsFiltered.some(
        (upcoming) => upcoming.catalogName === catalog.catalogName
      );
      return !isInLive && !isInUpcoming;
    }).length / catalogsPerPage
  );

  const getPageNumbers = () => {
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
  };

  const SkeletonCard = () => (
    <div className="group relative overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm rounded-lg">
      <div className="relative aspect-[4/3] bg-gray-200 animate-shimmer" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-shimmer" />
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <LuxuryBackground />
      <div className="container relative mx-auto px-4 mt-[40px] py-8 md:py-12">
        {/* Live Auctions Section */}
        {liveCatalogs.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
                <Sparkles className="h-4 w-4" />
                <span>LIVE AUCTIONS</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight text-luxury-charcoal">
                Live Auctions
              </h2>
              <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground px-4">
                Join our ongoing auctions and place your bids on exclusive
                luxury items.
              </p>
            </div>
            <div className="space-y-4">
              {liveCatalogs.map((catalog) => (
                <CatalogCard
                  key={catalog.catalogName}
                  catalog={catalog}
                  isLive={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Auctions Section */}
        {upcomingCatalogsFiltered.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
                <Sparkles className="h-4 w-4" />
                <span>UPCOMING AUCTIONS</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight text-luxury-charcoal">
                Upcoming Auctions
              </h2>
              <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground px-4">
                Get ready for our upcoming auctions featuring exclusive luxury
                items.
              </p>
            </div>
            <div className="space-y-4">
              {upcomingLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                upcomingCatalogsFiltered.map((catalog) => (
                  <CatalogCard
                    key={catalog.catalogName}
                    catalog={catalog}
                    isUpcoming={true}
                    timeRemaining={timers[catalog.catalogName]}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* All Catalogs Section - Only show if there are live auctions */}
        {/* {liveCatalogs.length > 0 && (
          <>
            <div className="mb-8 md:mb-12 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
                <Sparkles className="h-4 w-4" />
                <span>LUXURY AUCTIONS</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-luxury-charcoal">
                Auction Catalog
              </h1>
              <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground px-4">
                Explore our curated catalogs featuring the finest luxury items from
                prestigious collections.
              </p>
            </div>

            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {displayedCatalogs.length} of {totalCatalogs} Catalogs
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[240px] border-luxury-gold/20 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="name-asc">By name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">By name (Z-A)</SelectItem>
                    <SelectItem value="items-asc">
                      By items (Low to High)
                    </SelectItem>
                    <SelectItem value="items-desc">
                      By items (High to Low)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={catalogsPerPage.toString()}
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

            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : displayedCatalogs.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No additional catalogs available.
                </p>
              ) : (
                displayedCatalogs.map((catalog) => (
                  <CatalogCard key={catalog.catalogName} catalog={catalog} />
                ))
              )}
            </div>

            {totalCatalogs > 0 && (
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
          </>
        )} */}
      </div>
      <Footer />
    </>
  );
}
