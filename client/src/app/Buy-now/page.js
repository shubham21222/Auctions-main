'use client';
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Filters } from "./components/filters";
import { ProductCard } from "./components/product-card";
import { Skeleton } from "@/components/ui/skeleton"; // Ensure this path is correct

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?limit=${limit}&offset=${offset}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        setProducts((prevProducts) => [...prevProducts, ...data.products]);
        setHasMore(data.products.length === limit); // Check if there are more products to load
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [offset]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 && // Check if user is near the bottom
        !loading &&
        hasMore
      ) {
        setOffset((prevOffset) => prevOffset + limit); // Load more products by increasing the offset
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup the event listener
  }, [loading, hasMore]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 pt-[40px] to-gray-100">
        {/* Page Heading */}
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Explore Our Products
          </h1>
        </div>

        <div className="container mx-auto px-6 pb-8">
          <div className="mt-4 flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-72 shrink-0">
              <Filters />
            </aside>
            <div className="flex-1 space-y-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Featured Products
              </h2>

              {loading && products.length === 0 ? (
                // Skeleton Loading
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(limit)].map((_, index) => (
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
                  {products.map((product) => {
                    const productData = {
                      id: product["\ufeffID"] || product.ID,
                      image: product.Images?.split(",")[0]?.trim() || "",
                      name: product.Name,
                      price: product["Regular price"] || product["Sale price"] || "Price Unavailable",
                      slug: product.SKU || product["\ufeffID"] || product.ID || "default-slug",
                    };

                    return (
                      <ProductCard
                        key={productData.id}
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
              {!hasMore && <p className="text-center text-gray-500">No more products to load.</p>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}