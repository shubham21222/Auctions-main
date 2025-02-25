'use client';
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Filters } from "./components/filters";
import { ProductCard } from "./components/product-card";
import { Skeleton } from "@/components/ui/skeleton"; 
import { LuxuryBackground } from "../Auctions/components/luxury-background";
import config from "../config_BASE_URL";

export default function Home() {
  const [allProducts, setAllProducts] = useState([]); // Store all fetched products
  const [originalProducts, setOriginalProducts] = useState([]); // Store original unfiltered products
  const [displayedProducts, setDisplayedProducts] = useState([]); // Products for current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedSortField, setSelectedSortField] = useState("created_at");
  const [selectedSortOrder, setSelectedSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Categories state
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("https://bid.nyelizabeth.com/v1/api/category/all");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.items);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    }
    fetchCategories();
  }, []);

  // Fetch initial products (unfiltered)
  useEffect(() => {
    async function fetchInitialProducts() {
      try {
        setLoading(true);
        const response = await fetch(`${config.baseURL}/v1/api/product/filter`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setOriginalProducts(data.items || []);
        setAllProducts(data.items || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialProducts();
  }, []);

  // Fetch filtered products or reset to original
  useEffect(() => {
    async function fetchFilteredProducts() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          category: selectedCategories.join(","),
          status: selectedStatus,
          sortByPrice: selectedPriceRange,
          sortField: selectedSortField,
          sortOrder: selectedSortOrder,
          searchQuery: searchQuery,
        }).toString();

        const response = await fetch(`${config.baseURL}/v1/api/product/filter?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch filtered products");
        const data = await response.json();
        setAllProducts(data.items || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if filters are applied; otherwise, reset to original
    if (
      selectedCategories.length > 0 ||
      selectedStatus ||
      selectedPriceRange ||
      selectedSortField !== "created_at" ||
      selectedSortOrder !== "asc" ||
      searchQuery
    ) {
      fetchFilteredProducts();
    } else {
      setAllProducts(originalProducts); // Reset to original products when filters are cleared
    }
  }, [
    selectedCategories,
    selectedStatus,
    selectedPriceRange,
    selectedSortField,
    selectedSortOrder,
    searchQuery,
    originalProducts,
  ]);

  // Handle pagination
  useEffect(() => {
    if (allProducts.length > 0) {
      const total = allProducts.length;
      setTotalPages(Math.ceil(total / productsPerPage));
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      setDisplayedProducts(allProducts.slice(startIndex, endIndex));
    } else {
      setDisplayedProducts([]);
      setTotalPages(1);
    }
  }, [allProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setAllProducts(originalProducts); // Reset to original products
    setCurrentPage(1); // Reset to first page
  };

  return (
    <>
      <Header />
      <LuxuryBackground />
      <main className="min-h-screen pt-[40px]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
                onReset={handleReset} // Pass reset handler
              />
            </aside>
            <div className="flex-1 space-y-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Featured Products
              </h2>

              {loading && allProducts.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(productsPerPage)].map((_, index) => (
                    <div key={index} className="space-y-4">
                      <Skeleton className="h-[200px] w-full rounded-md" />
                      <Skeleton className="h-6 w-3/4 rounded-md" />
                      <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className="text-center text-red-500">Error: {error}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedProducts.map((product, index) => {
                    const uniqueKey = `${product._id}-${product.title}-${index}`;
                    const productData = {
                      id: uniqueKey,
                      image: product.image[0],
                      name: product.title,
                      price: product.price || "Price Unavailable",
                      slug: product._id,
                    };
                    return (
                      <ProductCard
                        key={uniqueKey}
                        image={productData.image}
                        name={productData.name}
                        price={productData.price}
                        slug={productData.slug}
                      />
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/60 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-full ${
                        currentPage === page
                          ? "bg-blue-800 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } transition-all`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/60 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    Next
                  </button>
                </div>
              )}

              {loading && allProducts.length > 0 && (
                <p className="text-center text-gray-500">Loading more products...</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}