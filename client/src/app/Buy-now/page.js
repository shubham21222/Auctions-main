'use client';
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Filters } from "./components/filters";
import { ProductCard } from "./components/product-card";
import { Skeleton } from "@/components/ui/skeleton"; 
import { LuxuryBackground } from "../Auctions/components/luxury-background";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.items); // Store the fetched categories
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    }

    fetchCategories();
  }, []);

  // Fetch all products initially
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/v1/api/product/filter");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        // Log the API response for debugging
        console.log("API Response (All Products):", data);

        // Update products state
        setProducts(data.items || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllProducts();
  }, []);

  // Fetch filtered products dynamically
  useEffect(() => {
    async function fetchFilteredProducts() {
      try {
        setLoading(true);
        // Construct the API URL with query parameters
        const queryParams = new URLSearchParams({
          category: selectedCategories.join(","),
          status: selectedStatus,
          sortByPrice: selectedPriceRange,
          sortField: selectedSortField,
          sortOrder: selectedSortOrder,
          searchQuery: searchQuery,
        }).toString();

        const response = await fetch(`http://localhost:4000/v1/api/product/filter?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch filtered products");
        }
        const data = await response.json();

        // Log the API response for debugging
        console.log("API Response (Filtered Products):", data);

        // Update products state
        setProducts(data.items || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch filtered products if any filter is applied
    if (
      selectedCategories.length > 0 ||
      selectedStatus ||
      selectedPriceRange ||
      selectedSortField !== "created_at" ||
      selectedSortOrder !== "asc" ||
      searchQuery
    ) {
      fetchFilteredProducts();
    }
  }, [
    selectedCategories,
    selectedStatus,
    selectedPriceRange,
    selectedSortField,
    selectedSortOrder,
    searchQuery,
  ]);

  return (
    <>
      <Header />
      <LuxuryBackground />
      <main className="min-h-screen pt-[40px] ">
        {/* Page Heading */}
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Explore Our Products
          </h1>
        </div>

        <div className="container mx-auto px-6 pb-8">
          <div className="mt-4 flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-72 shrink-0">
              <Filters
                categories={categories} // Pass categories to Filters
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
              />
            </aside>
            <div className="flex-1 space-y-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Featured Products
              </h2>

              {loading && products.length === 0 ? (
                // Skeleton Loading
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(10)].map((_, index) => (
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
                  {products.map((product, index) => {
                    const uniqueKey = `${product._id}-${product.title}-${index}`; // Append index for uniqueness
                    const productData = {
                      id: uniqueKey,
                      image: product.image[0],
                      name: product.title,
                      price: product.price || "Price Unavailable",
                      slug: product._id,
                    };

                    return (
                      <ProductCard
                        key={uniqueKey} // Use the composite key here
                        image={productData.image}
                        name={productData.name}
                        price={productData.price}
                        slug={productData.slug}
                      />
                    );
                  })}
                </div>
              )}

              {loading && products.length > 0 && (
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