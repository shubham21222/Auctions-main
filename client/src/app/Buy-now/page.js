'use client';

import { useEffect, useState } from "react";
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

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Controls initial loading state
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOption, setViewOption] = useState("60"); // Set default to 60 items per page
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

  // Categories state
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/category/all`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.items);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products with pagination
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        
        if (selectedCategories.length > 0) {
          params.append("category", selectedCategories.join(","));
        }
        
        if (selectedStatus) {
          params.append("status", selectedStatus);
        }
        
        if (selectedPriceRange) {
          params.append("sortByPrice", selectedPriceRange); // Triggers High Price or Low Price sorting
        }
        
        if (selectedSortField !== "created_at" || selectedSortOrder !== "desc") {
          params.append("sortField", selectedSortField);
          params.append("sortOrder", selectedSortOrder);
        }
        
        if (searchQuery) {
          params.append("searchQuery", searchQuery);
        }
        
        params.append("page", currentPage);
        params.append("limit", viewOption);
        
        const queryString = params.toString();
        
        const response = await fetch(`${config.baseURL}/v1/api/product/filter?${queryString}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        const products = data.items?.items || [];
        setAllProducts(products);
        setTotalItems(data.items?.total || 0);
        setTotalPages(Math.ceil((data.items?.total || 0) / parseInt(viewOption)));

        if (
          selectedCategories.length === 0 &&
          !selectedStatus &&
          !selectedPriceRange &&
          selectedSortField === "created_at" &&
          selectedSortOrder === "desc" &&
          !searchQuery
        ) {
          setOriginalProducts(products);
        }

        setDisplayedProducts(products);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [
    selectedCategories,
    selectedStatus,
    selectedPriceRange, // Ensures price filter changes trigger a refetch
    selectedSortField,
    selectedSortOrder,
    searchQuery,
    currentPage,
    viewOption,
  ]);

  // Generate pagination items with truncation
  const getPaginationItems = () => {
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
  };

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

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedStatus("");
    setSelectedPriceRange("");
    setSelectedSortField("created_at");
    setSelectedSortOrder("desc");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleViewDetails = (slug) => {
    router.push(`/products/${slug}`);
  };

  // Update productsPerPage when viewOption changes
  const productsPerPage = parseInt(viewOption);

  return (
    <>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(productsPerPage)].map((_, index) => (
                    <div key={index} className="space-y-4">
                      <Skeleton className="h-[450px] w-full rounded-xl bg-gray-400" />
                      <Skeleton className="h-10 w-3/4 rounded-xl bg-gray-400" />
                      <Skeleton className="h-8 w-1/2 rounded-xl bg-gray-400" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className="text-center text-red-500">Error: {error}</p>
              ) : displayedProducts.length === 0 ? (
                <p className="text-center text-gray-500">No products available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedProducts.map((product, index) => {
                    const uniqueKey = `${product._id}-${product.title}-${index}`;
                    const productData = {
                      id: uniqueKey,
                      image: product.image[0],
                      name: product.title,
                      price: product.estimateprice,
                      slug: product._id,
                    };
                    return (
                      <Link
                        key={uniqueKey}
                        href={`/products/${productData.slug}`}
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

                  {getPaginationItems().map((item, index) => (
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
    </>
  );
}