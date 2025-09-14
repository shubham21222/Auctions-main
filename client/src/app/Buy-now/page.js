'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Filters } from "./components/filters";
import { ProductCard } from "./components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LuxuryBackground } from "../Auctions/components/luxury-background";
import config from "../config_BASE_URL";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { WishlistProvider } from "./components/WishlistProvider";

// Add price formatting function
const formatPrice = (price) => {
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Controls initial loading state
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOption, setViewOption] = useState("24"); // Further reduced to 24 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  const auth = useSelector((state) => state.auth);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedSortField, setSelectedSortField] = useState("created_at");
  const [selectedSortOrder, setSelectedSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Categories state
  const [categories, setCategories] = useState([]);
  
  // Cache for products
  const [productsCache, setProductsCache] = useState(new Map());
  
  // Request cancellation
  const [abortController, setAbortController] = useState(null);
  
  // Progressive loading states
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isFetchingRef = useRef(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/category/all`, {
          headers: {
            'Cache-Control': 'max-age=3600', // Cache for 1 hour
          }
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.items || []);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
        // Set empty array as fallback
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Debounced search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);


  // Optimized fetch products function with aggressive caching and cancellation
  const fetchProducts = useCallback(async () => {
    const cacheKey = JSON.stringify({
      categories: selectedCategories.sort(),
      status: selectedStatus,
      priceRange: selectedPriceRange,
      sortField: selectedSortField,
      sortOrder: selectedSortOrder,
      searchQuery: debouncedSearchQuery,
      page: currentPage,
      limit: viewOption,
    });
    
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }
    
    // Create new abort controller
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    
    // Check cache first
    if (productsCache.has(cacheKey)) {
      const cachedData = productsCache.get(cacheKey);
      setAllProducts(cachedData.products);
      setTotalItems(cachedData.totalItems);
      setTotalPages(cachedData.totalPages);
      setDisplayedProducts(cachedData.products);
      setLoading(false);
      isFetchingRef.current = false;
      return;
    }

    try {
      setLoading(true);
      setLoadingProgress(10);
      
      const params = new URLSearchParams();
      
      if (selectedCategories.length > 0) {
        params.append("category", selectedCategories.join(","));
      }
      
      if (selectedStatus) {
        params.append("status", selectedStatus);
      }
      
      if (selectedPriceRange) {
        params.append("sortByPrice", selectedPriceRange);
      }
      
      if (selectedSortField !== "created_at" || selectedSortOrder !== "desc") {
        params.append("sortField", selectedSortField);
        params.append("sortOrder", selectedSortOrder);
      }
      
      if (debouncedSearchQuery) {
        params.append("searchQuery", debouncedSearchQuery);
      }
      
      params.append("page", currentPage);
      params.append("limit", viewOption);
      
      const queryString = params.toString();
      setLoadingProgress(30);
      
      // Use fast endpoint for initial load without filters
      const isInitialLoadWithoutFilters = isInitialLoad && 
        selectedCategories.length === 0 && 
        !selectedStatus && 
        !selectedPriceRange && 
        !debouncedSearchQuery &&
        selectedSortField === "created_at" && 
        selectedSortOrder === "desc";
      
      const endpoint = isInitialLoadWithoutFilters ? 
        `${config.baseURL}/v1/api/product/fast?page=${currentPage}&limit=${viewOption}` :
        `${config.baseURL}/v1/api/product/filter?${queryString}`;
      
      const response = await fetch(endpoint, {
        signal: newAbortController.signal,
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes cache
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch products");
      
      setLoadingProgress(60);
      const data = await response.json();
      setLoadingProgress(80);

      const products = data.items?.items || [];
      const totalItemsCount = data.items?.total || 0;
      const totalPagesCount = Math.ceil(totalItemsCount / parseInt(viewOption));

      // Cache the result
      setProductsCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, {
          products,
          totalItems: totalItemsCount,
          totalPages: totalPagesCount,
        });
        // Limit cache size to prevent memory issues
        if (newCache.size > 100) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        return newCache;
      });

      setAllProducts(products);
      setTotalItems(totalItemsCount);
      setTotalPages(totalPagesCount);

      if (
        selectedCategories.length === 0 &&
        !selectedStatus &&
        !selectedPriceRange &&
        selectedSortField === "created_at" &&
        selectedSortOrder === "desc" &&
        !debouncedSearchQuery
      ) {
        setOriginalProducts(products);
      }

      setDisplayedProducts(products);
      setLoadingProgress(100);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error('Fetch products error:', error);
      setError(error.message || 'Failed to load products');
      
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      setLoadingProgress(0);
      isFetchingRef.current = false;
    }
  }, [selectedCategories, selectedStatus, selectedPriceRange, selectedSortField, selectedSortOrder, debouncedSearchQuery, currentPage, viewOption]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger fetchProducts when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, selectedStatus, selectedPriceRange, selectedSortField, selectedSortOrder, debouncedSearchQuery, currentPage, viewOption]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  // Reset error state when filters change
  useEffect(() => {
    setError(null);
  }, [selectedCategories, selectedStatus, selectedPriceRange, selectedSortField, selectedSortOrder, debouncedSearchQuery, currentPage, viewOption]);

  // Memoized pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      items.push(1);
      if (leftBound > 2) items.push("...");
      for (let i = leftBound; i <= rightBound; i++) {
        items.push(i);
      }
      if (rightBound < totalPages - 1) items.push("...");
      items.push(totalPages);
    }

    return items;
  }, [totalPages, currentPage]);

  // Reset to first page when view option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewOption]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = useCallback(() => {
    setSelectedCategories([]);
    setSelectedStatus("");
    setSelectedPriceRange("");
    setSelectedSortField("created_at");
    setSelectedSortOrder("desc");
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
    // Clear cache on reset to ensure fresh data
    setProductsCache(new Map());
  }, []);

  const handleViewDetails = (slug) => {
    router.push(`/products/${slug}`);
  };

  // Update productsPerPage when viewOption changes
  const productsPerPage = parseInt(viewOption);

  return (
    <WishlistProvider>
      <Header />
      <LuxuryBackground />
      <main className="min-h-screen pt-[100px]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Explore Our Products
          </h1>
        </div>

        <div className="container mx-auto px-6 pb-8">
          <div className="mt-4 flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-72 shrink-0">
              <Filters
                categories={categories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                selectedSortField={selectedSortField}
                setSelectedSortField={setSelectedSortField}
                selectedSortOrder={selectedSortOrder}
                setSelectedSortOrder={setSelectedSortOrder}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onReset={handleReset}
              />
            </aside>
            <div className="flex-1 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                  Featured Products
                </h2>
                <Select value={viewOption} onValueChange={setViewOption}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>{`${viewOption} per page`}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="36">36 per page</SelectItem>
                    <SelectItem value="60">60 per page</SelectItem>
                    <SelectItem value="120">120 per page</SelectItem>
                    <SelectItem value="240">240 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {/* Loading Progress Bar */}
                  {isInitialLoad && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Loading Message */}
                  <div className="text-center text-gray-600">
                    {isInitialLoad ? `Loading products... ${loadingProgress}%` : "Loading products..."}
                  </div>
                  
                  {/* Skeleton Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(productsPerPage)].map((_, index) => (
                      <div key={index} className="space-y-4">
                        <Skeleton className="h-[450px] w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-10 w-3/4 rounded-xl bg-gray-200" />
                        <Skeleton className="h-8 w-1/2 rounded-xl bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="text-center space-y-4">
                  <p className="text-red-500">Error: {error}</p>
                  <button 
                    onClick={() => {
                      setError(null);
                      fetchProducts();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : displayedProducts.length === 0 ? (
                <p className="text-center text-gray-500">No products available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedProducts.map((product) => {
                    const productData = {
                      image: product.image?.[0] || "/placeholder.svg",
                      name: product.title || "Untitled Product",
                      price: formatPrice(product.estimateprice),
                      slug: product._id,
                    };
                    return (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="block"
                      >
                        <ProductCard
                          image={productData.image}
                          name={productData.name}
                          price={productData.price}
                          slug={productData.slug}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2 flex-wrap gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-full bg-blue-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    Previous
                  </button>

                  {paginationItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => typeof item === "number" && handlePageChange(item)}
                      disabled={item === "..."}
                      className={`px-4 py-2 rounded-full ${
                        currentPage === item
                          ? "bg-blue-800 text-white"
                          : item === "..."
                          ? "bg-transparent text-gray-500 cursor-default"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } transition-all`}
                    >
                      {item}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-full bg-blue-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </WishlistProvider>
  );
}