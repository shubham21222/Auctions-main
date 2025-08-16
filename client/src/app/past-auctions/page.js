"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import config from "@/app/config_BASE_URL";
import { format } from "date-fns";
import useEmblaCarousel from 'embla-carousel-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ProductCarousel = ({ images }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative rounded-lg overflow-hidden border bg-gray-100">
        <Image
          src="/placeholder.svg"
          alt="No image available"
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative aspect-square">
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-white/50"
                style={{
                  backgroundColor: emblaApi?.selectedScrollSnap() === index ? 'white' : 'rgba(255,255,255,0.5)'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductCardSkeleton = () => (
  <div className="bg-white border rounded-xl shadow-md overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
);

const CatalogCardSkeleton = () => (
  <div className="bg-white border rounded-xl shadow-md overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const formatPrice = (price) => {
  if (!price && price !== 0) return "N/A";
  return Number(price).toFixed(2);
};

export default function PastAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [scrapedAuctions, setScrapedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date-descending");
  const [auctionDate, setAuctionDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogPagination, setCatalogPagination] = useState(null);
  const [productSortBy, setProductSortBy] = useState('lotNumber');
  const [productSortOrder, setProductSortOrder] = useState('asc');
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [catalogPaginationInfo, setCatalogPaginationInfo] = useState(null);
  const [catalogClickLoading, setCatalogClickLoading] = useState(false);
  const itemsPerPage = 50;

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
    setLoadingProgress(0);
    setCatalogPaginationInfo(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch API data using axios with pagination
        console.log('Fetching catalogs...');
        const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalogs`, {
          params: {
            page: 1,
            limit: 100, // Increased from 20 to 100 to get more catalogs initially
            sortBy: 'uploadedAt',
            sortOrder: 'desc'
          },
          timeout: 30000 // 30 second timeout
        });
        console.log('Catalogs API Response:', response.data);

        // Process API data if available
        if (response.data?.items?.catalogs) {
          const catalogs = response.data.items.catalogs;
          const pagination = response.data.items.pagination;
          console.log(`Processing ${catalogs.length} catalogs...`);
          console.log(`Catalog pagination:`, pagination);
          console.log(`Total catalogs in database: ${pagination.totalCatalogs}`);
          console.log(`Current page: ${pagination.currentPage}`);
          console.log(`Has next page: ${pagination.hasNextPage}`);
          
          // Store catalog pagination info
          setCatalogPaginationInfo(pagination);
          
          // Don't fetch product images initially - just show catalogs with counts
          // This makes the initial load much faster
          const catalogsWithPlaceholders = catalogs.map(catalog => ({
            ...catalog,
            firstImage: "/placeholder.svg" // Use placeholder until catalog is clicked
          }));
          
          setAuctions(catalogsWithPlaceholders);
          setLoadingProgress(100);
        }

        // Fetch scraped data
        const scrapedResponse = await fetch('/scraped_auction_data.json');
        const scrapedData = await scrapedResponse.json();

        // Process scraped data if available
        if (Array.isArray(scrapedData)) {
          setScrapedAuctions(scrapedData);
        }
      } catch (err) {
        console.error("Error fetching auction data:", err);
        let errorMessage = err.message;
        
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response?.status === 404) {
          errorMessage = 'API endpoint not found.';
        } else if (!err.response) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        setError(errorMessage);
        setAuctions([]);
        setScrapedAuctions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [retryCount]);

  const handleCatalogClick = async (catalogId) => {
    setCatalogClickLoading(true);
    setCatalogLoading(true);
    try {
      console.log('Fetching products for catalog:', catalogId);
      const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalog/${catalogId}/products`, {
        params: {
          page: 1,
          limit: itemsPerPage,
          sortBy: productSortBy,
          sortOrder: productSortOrder
        }
      });
      console.log('Products API Response:', response.data);
      
      if (response.data?.items?.products) {
        const products = response.data.items.products;
        const pagination = response.data.items.pagination;
        // Get the first product's image for the catalog preview
        const firstProduct = products[0];
        setCatalogProducts(products);
        setCatalogPagination(pagination);
        setSelectedCatalog({
          id: catalogId,
          firstImage: firstProduct?.images?.[0] || "/placeholder.svg"
        });
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching catalog products:", err);
      setError(err.message);
    } finally {
      setCatalogLoading(false);
      setCatalogClickLoading(false);
    }
  };

  const handleBackToCatalogs = () => {
    setSelectedCatalog(null);
    setCatalogProducts([]);
    setCatalogPagination(null);
    setCurrentPage(1);
  };

  const loadMoreProducts = async (page) => {
    if (!selectedCatalog) return;
    
    setCatalogLoading(true);
    try {
      const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalog/${selectedCatalog.id}/products`, {
        params: {
          page: page,
          limit: itemsPerPage,
          sortBy: productSortBy,
          sortOrder: productSortOrder
        }
      });
      
      if (response.data?.items?.products) {
        const products = response.data.items.products;
        const pagination = response.data.items.pagination;
        setCatalogProducts(products);
        setCatalogPagination(pagination);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Error fetching more products:", err);
      setError(err.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleProductSortChange = async (newSortBy, newSortOrder) => {
    setProductSortBy(newSortBy);
    setProductSortOrder(newSortOrder);
    setCurrentPage(1);
    await loadMoreProducts(1);
  };

  const loadMoreCatalogs = async (page) => {
    setLoading(true);
    try {
      console.log(`Loading more catalogs: page ${page}`);
      const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalogs`, {
        params: {
          page: page,
          limit: 100,
          sortBy: 'uploadedAt',
          sortOrder: 'desc'
        },
        timeout: 30000
      });

      if (response.data?.items?.catalogs) {
        const newCatalogs = response.data.items.catalogs;
        const pagination = response.data.items.pagination;
        
        console.log(`Loaded ${newCatalogs.length} new catalogs for page ${page}`);
        
        // Don't fetch product images - just show catalogs with counts
        const newCatalogsWithPlaceholders = newCatalogs.map(catalog => ({
          ...catalog,
          firstImage: "/placeholder.svg" // Use placeholder until catalog is clicked
        }));
        
        // If this is page 1, replace all catalogs
        // If this is page 2+, append to existing catalogs
        if (page === 1) {
          setAuctions(newCatalogsWithPlaceholders);
        } else {
          setAuctions(prevCatalogs => [...prevCatalogs, ...newCatalogsWithPlaceholders]);
        }
        
        // Update pagination info to reflect the new state
        setCatalogPaginationInfo(pagination);
        setCurrentPage(page);
        
        console.log(`Total catalogs now: ${page === 1 ? newCatalogsWithPlaceholders.length : auctions.length + newCatalogsWithPlaceholders.length}`);
        console.log(`Updated pagination:`, pagination);
      }
    } catch (err) {
      console.error("Error loading more catalogs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedCatalogs = React.useMemo(() => {
    let sorted = [...auctions];
    if (sortBy === "date-ascending") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "date-descending") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "title") {
      sorted.sort((a, b) => (a.catalogName || "").localeCompare(b.catalogName || ""));
    }
    return sorted;
  }, [auctions, sortBy]);

  const filteredCatalogs = React.useMemo(() => {
    let filtered = sortedCatalogs;
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((catalog) => {
        const searchableFields = [
          catalog.catalogName,
          catalog.description,
          catalog.createdAt,
          // Add any other fields you want to search
        ].map(field => (field || "").toString().toLowerCase());
        
        return searchableFields.some(field => field.includes(query));
      });
    }
    return filtered;
  }, [sortedCatalogs, debouncedSearchQuery]);

  const paginatedCatalogs = filteredCatalogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedProducts = catalogProducts;

  const totalPages = selectedCatalog 
    ? (catalogPagination ? catalogPagination.totalPages : 1)
    : (catalogPaginationInfo ? catalogPaginationInfo.totalPages : 1);

  const getPaginationRange = () => {
    const range = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (right < totalPages) range.push(totalPages);

    return range;
  };

  const handleAuctionClick = (auction) => {
    setSelectedAuction(auction);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-12 px-4 mt-[60px] min-h-screen">
          <Skeleton className="h-12 w-64 mx-auto mb-10" />
          
          {/* Progress Bar */}
          {loadingProgress > 0 && (
            <div className="max-w-md mx-auto mb-8">
              <div className="text-center text-sm text-gray-600 mb-2">
                Loading catalogs... {Math.round(loadingProgress)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CatalogCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) return (
    <div className="text-center py-10">
      <div className="text-red-500 mb-4">Error: {error}</div>
      <Button onClick={retryFetch} variant="outline">
        Retry
      </Button>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 mt-[60px] min-h-screen">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 tracking-tight">
          Past Auctions
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Section */}
          <div className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            {selectedCatalog ? (
              <Button
                variant="secondary"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={handleBackToCatalogs}
              >
                ← Back to Catalogs
              </Button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Search Catalogs</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by name, description..."
                      className="w-full bg-gray-100 pr-8"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    {searchQuery !== debouncedSearchQuery && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full bg-gray-100">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-ascending">Date: Ascending</SelectItem>
                      <SelectItem value="date-descending">Date: Descending</SelectItem>
                      <SelectItem value="title">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="secondary"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setSortBy("date-descending");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </Button>
              </>
            )}
          </div>

          {/* Content Section */}
          <div className="lg:col-span-3 space-y-6">
            {catalogLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : selectedCatalog ? (
              // Products Grid
              <>
                {/* Product Sorting Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-lg font-semibold text-gray-800">
                    Products in {selectedCatalog.catalogName || 'Catalog'}
                  </div>
                  <div className="flex gap-2">
                    <Select value={productSortBy} onValueChange={(value) => handleProductSortChange(value, productSortOrder)}>
                      <SelectTrigger className="w-32 bg-gray-100">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lotNumber">Lot Number</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="startPrice">Start Price</SelectItem>
                        <SelectItem value="finalPrice">Final Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={productSortOrder} onValueChange={(value) => handleProductSortChange(productSortBy, value)}>
                      <SelectTrigger className="w-20 bg-gray-100">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">↑</SelectItem>
                        <SelectItem value="desc">↓</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paginatedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleAuctionClick(product)}
                        className="bg-white border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group"
                      >
                        <div className="relative aspect-square">
                          <ProductCarousel images={product.images} />
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex justify-between">
                              <span className="font-medium">Lot:</span>
                              <span>{product.lotNumber}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium">Estimate:</span>
                              <span>${formatPrice(product.lowEstimate)} - ${formatPrice(product.highEstimate)}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium">Condition:</span>
                              <span>{product.condition || "N/A"}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                    No products found in this catalog.
                  </div>
                )}
              </>
            ) : (
              // Catalogs Grid
              <>
                {/* Info message */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-blue-800">
                      <strong>Tip:</strong> Click on any catalog to view its products. Products are loaded on-demand for faster browsing.
                    </div>
                  </div>
                </div> */}

                {paginatedCatalogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedCatalogs.map((catalog) => (
                      <div
                        key={catalog._id}
                        onClick={() => handleCatalogClick(catalog._id)}
                        className="bg-white border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                      >
                        <div className="relative aspect-video">
                          <Image
                            src={catalog.firstImage || "/placeholder.svg"}
                            alt={catalog.catalogName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {/* Overlay to indicate it's clickable */}
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="text-white text-center">
                              <div className="text-lg font-semibold">Click to View</div>
                              <div className="text-sm">{catalog.productCount || 0} Products</div>
                            </div>
                          </div>
                          
                          {/* Loading indicator when catalog is being clicked */}
                          {catalogClickLoading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <div className="text-sm">Loading Products...</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                            {catalog.catalogName}
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-gray-600">
                              Created: {format(new Date(catalog.createdAt), "PPp")}
                            </p>
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              {catalog.productCount || 0} products
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                    No catalogs found for the selected filters.
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="space-y-4 pt-8">
                {/* Page Info */}
                {selectedCatalog && catalogPagination ? (
                  <div className="text-center text-sm text-gray-600">
                    Showing page {catalogPagination.currentPage} of {catalogPagination.totalPages} 
                    ({catalogPagination.totalProducts} total products)
                  </div>
                ) : catalogPaginationInfo ? (
                  <div className="text-center text-sm text-gray-600">
                    Showing page {catalogPaginationInfo.currentPage} of {catalogPaginationInfo.totalPages} 
                    ({catalogPaginationInfo.totalCatalogs} total catalogs)
                  </div>
                ) : null}
                
                {/* Load More Button for Catalogs */}
                {!selectedCatalog && catalogPaginationInfo && catalogPaginationInfo.hasNextPage && (
                  <div className="text-center space-y-2">
                    <Button 
                      onClick={() => loadMoreCatalogs(catalogPaginationInfo.currentPage + 1)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? 'Loading...' : `Load More Catalogs (${catalogPaginationInfo.totalCatalogs - (catalogPaginationInfo.currentPage * catalogPaginationInfo.limit)} remaining)`}
                    </Button>
                    
                    {loading && (
                      <div className="text-sm text-gray-600">
                        Loading additional catalogs... Please wait.
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0"
                    onClick={() => {
                      if (selectedCatalog) {
                        loadMoreProducts(currentPage - 1);
                      } else {
                        loadMoreCatalogs(currentPage - 1);
                      }
                    }}
                    disabled={currentPage === 1 || catalogLoading}
                  >
                    ←
                  </Button>
                  {getPaginationRange().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : "outline"}
                      className={`w-10 h-10 p-0 text-sm font-medium ${page === "..." ? "cursor-default hover:bg-transparent" : ""}`}
                      onClick={() => {
                        if (typeof page === "number") {
                          if (selectedCatalog) {
                            loadMoreProducts(page);
                          } else {
                            loadMoreCatalogs(page);
                          }
                        }
                      }}
                      disabled={page === "..." || catalogLoading}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0"
                    onClick={() => {
                      if (selectedCatalog) {
                        loadMoreProducts(currentPage + 1);
                      } else {
                        loadMoreCatalogs(currentPage + 1);
                      }
                    }}
                    disabled={currentPage === totalPages || catalogLoading}
                  >
                    →
                  </Button>
                </div>
                
                {catalogLoading && (
                  <div className="text-center text-sm text-gray-600">
                    Loading products...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedAuction?.title || "Product Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedAuction && (
            <div className="space-y-6">
              {/* Product Images Carousel */}
              {selectedAuction.images && selectedAuction.images.length > 0 && (
                <div className="w-full">
                  <ProductCarousel images={selectedAuction.images} />
                </div>
              )}

              {/* Product Details */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Lot Number</p>
                        <p className="font-medium text-gray-900">{selectedAuction.lotNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Condition</p>
                        <p className="font-medium text-gray-900">{selectedAuction.condition || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">SKU</p>
                        <p className="font-medium text-gray-900">{selectedAuction.sku || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created Date</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(selectedAuction.createdAt), "PPp")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Pricing Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Starting Price</p>
                        <p className="font-medium text-gray-900">${formatPrice(selectedAuction.startPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Final Price</p>
                        <p className="font-medium text-gray-900">${formatPrice(selectedAuction.finalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Low Estimate</p>
                        <p className="font-medium text-gray-900">${formatPrice(selectedAuction.lowEstimate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">High Estimate</p>
                        <p className="font-medium text-gray-900">${formatPrice(selectedAuction.highEstimate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reserve Price</p>
                        <p className="font-medium text-gray-900">${formatPrice(selectedAuction.reservePrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Online Price</p>
                        <p className="font-medium text-gray-900">${formatPrice(selectedAuction.onlinePrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description - Now only shown in modal */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedAuction.description?.replace(/<br>|<BR>/g, '<br/>') || "No description available" 
                    }}
                  />
                </div>

                {/* Additional Information */}
                {selectedAuction.url && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Additional Information</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">URL:</span>{" "}
                      <a 
                        href={selectedAuction.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedAuction.url}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}