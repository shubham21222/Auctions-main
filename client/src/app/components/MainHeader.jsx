'use client';
import React, { useState, useEffect } from "react";
import { HiMenu, HiX, HiSearch } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken, removeUser } from "@/redux/authSlice";
import config from "../config_BASE_URL";
import { Skeleton } from "@/components/ui/skeleton";

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
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  // Handle search input change with API call
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await axios.get(
          `${config.baseURL}/v1/api/product/filter?searchQuery=${encodeURIComponent(searchQuery)}&limit=10`
        );
        const products = response.data.items?.items || [];
        setSearchResults(products.slice(0, 10)); // Ensure only 10 results
      } catch (error) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300); // Debounce to avoid too many requests

    return () => clearTimeout(debounce);
  }, [searchQuery]);

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

  // Handle search input change and trigger parent filtering
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value); // Update parent state to trigger Home's fetch
  };

  return (
    <header
      className={`fixed md:top-9 top-4 left-0 z-40 right-0 transition-all duration-300 w-full max-w-screen-xl mx-auto ${isScrolled
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
          <div className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl rounded-xl mt-2 z-50 max-h-96 overflow-y-auto border border-gray-100">
            {searchLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="p-4">
                {searchResults.map((product) => (
                  <li key={product._id} className="border-b border-gray-100 last:border-b-0">
                    <Link
                      href={`/product/${product._id}`}
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                    >
                      <Image
                        src={product.image?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="object-cover rounded-md mr-3 shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                        <p className="text-xs text-gray-600">${product.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-gray-500 text-sm text-center font-medium">No products found</p>
            )}
          </div>
        )}

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
            {/* Full-Width Search Results Dropdown for Mobile */}
            {(searchQuery || searchLoading) && (
              <div className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl rounded-xl mt-2 z-50 max-h-96 overflow-y-auto border border-gray-100">
                {searchLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <Skeleton key={index} className="h-14 w-full rounded-lg bg-gray-100" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="p-4">
                    {searchResults.map((product) => (
                      <li key={product._id} className="border-b border-gray-100 last:border-b-0">
                        <Link
                          href={`/product/${product._id}`}
                          className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                        >
                          <Image
                            src={product.image?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="object-cover rounded-md mr-3 shadow-sm"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                            <p className="text-xs text-gray-600">${product.price?.toLocaleString()}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
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
              <Link href="/participated-auctions" className="hover:text-purple-600">
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
                        <Link href="/profile" className="hover:bg-gray-100 px-4 py-2 rounded">
                          Profile
                        </Link>
                        <Link href="/auctions" className="hover:bg-gray-100 px-4 py-2 rounded">
                          Auctions
                        </Link>
                        <Link href="/purchases" className="hover:bg-gray-100 px-4 py-2 rounded">
                          Purchases
                        </Link>
                        <Link href="/seller-portal" className="hover:bg-gray-100 px-4 py-2 rounded">
                          Seller Portal
                        </Link>
                        <button
                          className="hover:bg-gray-100 px-4 py-2 rounded text-left"
                          onClick={handleLogout}
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