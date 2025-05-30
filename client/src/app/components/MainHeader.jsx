'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiMenu, HiX, HiSearch } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken, removeUser } from "@/redux/authSlice";
import config from "../config_BASE_URL";
import { Skeleton } from "@/components/ui/skeleton";

// Add image proxy function
const getImageUrl = (originalUrl) => {
  if (!originalUrl) return "/placeholder.svg";
  
  // If the URL is from globazone, use our proxy endpoint
  if (originalUrl.includes('globazone-item-images.elady.com')) {
    return `${config.baseURL}/v1/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
  }
  
  return originalUrl;
};

const MainHeader = ({
  isScrolled, 
  isMobile,
  menuOpen,
  setMenuOpen,
  showSearchBar,
  setShowSearchBar,
  searchQuery,
  setSearchQuery,
  handleSearch,
  setShowLoginModal,
  setShowSignupModal,
}) => {
  const { isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 100;
  const searchResultsRef = useRef(null);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  // Add image error handling state
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (productId, imageUrl) => {
    setFailedImages(prev => new Set([...prev, `${productId}-${imageUrl}`]));
  };

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setDisplayedResults([]);
      setPage(1);
      setHasMore(true);
      setSearchLoading(false);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setSearchLoading(true);
    try {
      const normalizedQuery = query.toLowerCase().trim();
      const response = await axios.get(
        `${config.baseURL}/v1/api/product/filter?searchQuery=${encodeURIComponent(normalizedQuery)}&limit=10000`,
        {
          signal: abortControllerRef.current.signal
        }
      );
      
      const products = response.data.items?.items || [];
      setSearchResults(products);
      setDisplayedResults(products.slice(0, ITEMS_PER_PAGE));
      setHasMore(products.length > ITEMS_PER_PAGE);
      setPage(1);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Search error:", error);
        setSearchResults([]);
        setDisplayedResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search input change with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, debouncedSearch]);

  // Handle scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (!searchResultsRef.current || !hasMore || searchLoading) return;

      const { scrollTop, scrollHeight, clientHeight } = searchResultsRef.current;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    };

    const searchResultsElement = searchResultsRef.current;
    if (searchResultsElement) {
      searchResultsElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (searchResultsElement) {
        searchResultsElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, searchLoading, searchResults]);

  const loadMore = () => {
    if (searchLoading || !hasMore) return;

    const nextPage = page + 1;
    const start = 0;
    const end = nextPage * ITEMS_PER_PAGE;
    const newItems = searchResults.slice(start, end);

    setDisplayedResults(newItems);
    setPage(nextPage);
    setHasMore(end < searchResults.length);
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await axios.post(
        `${config.baseURL}/v1/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      dispatch(removeToken());
      dispatch(removeUser());
      window.location.href = '/';
      setMenuOpen(false);
    } catch (error) {
      alert('An error occurred while logging out. Please try again.');
    }
  };

  // Keep the original handleSearchInput
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  // Common search result click handler for both mobile and desktop
  const handleSearchResultClick = (productId) => {
    setSearchQuery("");
    setShowSearchBar(false);
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed md:top-9 top-4 left-0 z-40 right-0 transition-all duration-300 w-full max-w-screen-xl mx-auto ${
        isScrolled
          ? "bg-white/5 shadow-lg rounded-full text-black border border-white/18"
          : "bg-transparent text-black"
      }`}
      style={{
        padding: isScrolled
          ? isMobile
            ? "3px"
            : "18px"
          : isMobile
            ? "5px"
            : "20px",
        boxShadow: isScrolled ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)" : "none",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="container mx-auto md:px-6 px-4 relative">
        <div className="flex items-center justify-between">
          {isMobile && (
            <button
              className="p-2 text-black font-semibold z-50"
              onClick={() => setShowSearchBar(!showSearchBar)}
              aria-label="Toggle search"
            >
              <HiSearch className="text-2xl" />
            </button>
          )}
          <div
            className={`flex items-center ${isMobile ? "w-full justify-center" : ""}`}
          >
            <Link href="/" className="flex-grow-0">
              <Image
                src="https://img1.wsimg.com/isteam/ip/05b280c7-f839-4e4d-9316-4bf01d28f2df/logo/b9e8f767-116c-4444-aab2-66386e072ec2.png"
                alt="NY Elizabeth"
                width={100}
                height={100}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {isMobile && (
            <button
              className="p-2 text-black font-semibold z-50"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <HiX className="text-2xl" />
              ) : (
                <HiMenu className="text-2xl" />
              )}
            </button>
          )}

          {!isMobile && (
            <>
              <nav className="hidden md:flex space-x-6 text-sm sm:text-base items-center font-medium">
                <Link href="/Auctions" className="hover:text-purple-600">
                  Auctions
                </Link>
                <Link href="/Buy-now" className="hover:text-purple-600">
                  Buy Now
                </Link>
                <Link href="/private-sales" className="hover:text-purple-600">
                  Private Sales
                </Link>
                <Link href="/Sell" className="hover:text-purple-600">
                  Sell
                </Link>
              </nav>
              <div className="relative w-64 flex-grow md:flex-grow-0">
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                  />
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </form>
              </div>
            </>
          )}
        </div>

        {/* Full-Width Search Results Dropdown for Desktop */}
        {!isMobile && (searchQuery || searchLoading) && (
          <div 
            ref={searchResultsRef}
            className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl rounded-xl mt-2 z-50 max-h-96 overflow-y-auto border border-gray-100"
          >
            {searchLoading && page === 1 ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : displayedResults.length > 0 ? (
              <div className="p-4">
                {displayedResults.map((product) => {
                  const imageUrl = product.image?.[0];
                  const imageKey = `${product._id}-${imageUrl}`;
                  const hasFailed = failedImages.has(imageKey);
                  
                  return (
                    <div key={product._id} className="border-b border-gray-100 last:border-b-0">
                      <Link
                        href={`/products/${product._id}`}
                        className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                        onClick={() => handleSearchResultClick(product._id)}
                      >
                        <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                          {!hasFailed ? (
                            <Image
                              src={getImageUrl(imageUrl)}
                              alt={product.title}
                              fill
                              sizes="48px"
                              className="object-cover rounded-md shadow-sm"
                              onError={() => handleImageError(product._id, imageUrl)}
                              priority={false}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                          <p className="text-xs text-gray-600 truncate">Estimate: {product.estimateprice}</p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
                {searchLoading && page > 1 && (
                  <div className="p-4 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  </div>
                )}
              </div>
            ) : (
              <p className="p-4 text-gray-500 text-sm text-center font-medium">No products found</p>
            )}
          </div>
        )}

        {/* Mobile Search Bar */}
        {isMobile && showSearchBar && (
          <div className="relative w-full mt-4">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchInput}
                className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
              />
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </form>

            {/* Mobile Search Results */}
            {(searchQuery || searchLoading) && (
              <div 
                ref={searchResultsRef}
                className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl rounded-xl mt-2 z-50 max-h-96 overflow-y-auto border border-gray-100"
              >
                {searchLoading && page === 1 ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <Skeleton key={index} className="h-14 w-full rounded-lg bg-gray-100" />
                    ))}
                  </div>
                ) : displayedResults.length > 0 ? (
                  <div className="p-4">
                    {displayedResults.map((product) => {
                      const imageUrl = product.image?.[0];
                      const imageKey = `${product._id}-${imageUrl}`;
                      const hasFailed = failedImages.has(imageKey);
                      
                      return (
                        <div key={product._id} className="border-b border-gray-100 last:border-b-0">
                          <Link
                            href={`/products/${product._id}`}
                            className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                            onClick={() => handleSearchResultClick(product._id)}
                          >
                            <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                              {!hasFailed ? (
                                <Image
                                  src={getImageUrl(imageUrl)}
                                  alt={product.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover rounded-md shadow-sm"
                                  onError={() => handleImageError(product._id, imageUrl)}
                                  priority={false}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                              <p className="text-xs text-gray-600 truncate">Estimate: {product.estimateprice}</p>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                    {searchLoading && page > 1 && (
                      <div className="p-4 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="p-4 text-gray-500 text-sm text-center font-medium">No products found</p>
                )}
              </div>
            )}
          </div>
        )}

        {menuOpen && (
          <nav className="absolute top-full left-0 w-full bg-white text-black rounded-lg shadow-lg z-50 md:hidden mt-2">
            <div className="flex flex-col items-center text-sm font-medium space-y-2 py-4">
              <button className="hover:text-gray-600 text-sm">
                <span>EN</span>
                <span className="ml-1">▼</span>
              </button>
              <Link href="/exclusive-access" className="hover:text-purple-600">
                EXCLUSIVE ACCESS
              </Link>
              <Link href="/about-us" className="hover:text-purple-600">
                ABOUT
              </Link>
              <Link href="/past-auctions" className="hover:text-purple-600">
                PAST AUCTIONS
              </Link>
              <Link href="/FAQs" className="hover:text-purple-600">
                FAQ
              </Link>
              <Link href="/Auctions" className="hover:text-purple-600">
                Auctions
              </Link>
              <Link href="/Buy-now" className="hover:text-purple-600">
                Buy Now
              </Link>
              <Link href="/private-sales" className="hover:text-purple-600">
                Private Sales
              </Link>
              <Link href="/Sell" className="hover:text-purple-600">
                Sell
              </Link>

              {isAuthenticated ? (
                <div className="relative w-full">
                  <button
                    className="bg-[#002654] hover:bg-[#002654]/90 text-white rounded px-4 py-1 text-sm mt-2 w-full"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    MY ACCOUNT ▼
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-48 bg-white text-black rounded-lg shadow-lg mt-2 z-1000">
                      <div className="flex flex-col space-y-1 p-2">
                        <Link 
                          href="/my-account" 
                          className="hover:bg-gray-100 px-4 py-2 rounded"
                          onClick={() => setMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/participated-auctions" 
                          className="hover:bg-gray-100 px-4 py-2 rounded"
                          onClick={() => setMenuOpen(false)}
                        >
                          Auctions
                        </Link>
                        <Link 
                          href="/purchases" 
                          className="hover:bg-gray-100 px-4 py-2 rounded"
                          onClick={() => setMenuOpen(false)}
                        >
                          Purchases
                        </Link>
                        <Link 
                          href="/seller-portal" 
                          className="hover:bg-gray-100 px-4 py-2 rounded"
                          onClick={() => setMenuOpen(false)}
                        >
                          Seller Portal
                        </Link>
                        <button
                          className="hover:bg-gray-100 px-4 py-2 rounded text-left"
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowLoginModal(true);
                    }}
                    className="w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Login
                  </button>
                  <button
                    className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowSignupModal(true);
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default MainHeader;