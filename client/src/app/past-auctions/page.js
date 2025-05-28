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
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch API data using axios
        console.log('Fetching catalogs...');
        const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalogs`);
        console.log('Catalogs API Response:', response.data);

        // Process API data if available
        if (response.data?.items?.catalogs) {
          const catalogs = response.data.items.catalogs;
          // Get first product image for each catalog
          const catalogsWithImages = await Promise.all(
            catalogs.map(async (catalog) => {
              try {
                const productsResponse = await axios.get(
                  `${config.baseURL}/v1/api/past-auction/catalog/${catalog._id}/products`
                );
                const firstProduct = productsResponse.data?.items?.products?.[0];
                return {
                  ...catalog,
                  firstImage: firstProduct?.images?.[0] || "/placeholder.svg"
                };
              } catch (err) {
                console.error(`Error fetching first product for catalog ${catalog._id}:`, err);
                return {
                  ...catalog,
                  firstImage: "/placeholder.svg"
                };
              }
            })
          );
          setAuctions(catalogsWithImages);
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
        setError(err.message);
        setAuctions([]);
        setScrapedAuctions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCatalogClick = async (catalogId) => {
    setCatalogLoading(true);
    try {
      console.log('Fetching products for catalog:', catalogId);
      const response = await axios.get(`${config.baseURL}/v1/api/past-auction/catalog/${catalogId}/products`);
      console.log('Products API Response:', response.data);
      
      if (response.data?.items?.products) {
        const products = response.data.items.products;
        // Get the first product's image for the catalog preview
        const firstProduct = products[0];
        setCatalogProducts(products);
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
    }
  };

  const handleBackToCatalogs = () => {
    setSelectedCatalog(null);
    setCatalogProducts([]);
    setCurrentPage(1);
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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
  }, [sortedCatalogs, searchQuery]);

  const paginatedCatalogs = filteredCatalogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedProducts = catalogProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(
    selectedCatalog ? catalogProducts.length / itemsPerPage : filteredCatalogs.length / itemsPerPage
  );

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

  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

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
                  <Input
                    type="text"
                    placeholder="Search by name, description..."
                    className="w-full bg-gray-100"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
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
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                            {catalog.catalogName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-2">
                            Created: {format(new Date(catalog.createdAt), "PPp")}
                          </p>
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
              <div className="flex justify-center items-center gap-2 pt-8">
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ←
                </Button>
                {getPaginationRange().map((page, index) => (
                  <Button
                    key={index}
                    variant={page === currentPage ? "default" : "outline"}
                    className={`w-10 h-10 p-0 text-sm font-medium ${page === "..." ? "cursor-default hover:bg-transparent" : ""}`}
                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                    disabled={page === "..."}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  →
                </Button>
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