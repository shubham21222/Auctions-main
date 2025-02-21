"use client";
import React, { useEffect, useState } from "react";
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

export default function PastAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date-ascending");
  const [auctionDate, setAuctionDate] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of auctions per page

  // Fetch data from API
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch("/api/auctions");
        if (!response.ok) throw new Error("Failed to fetch auctions");
        const data = await response.json();
        setAuctions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  // Sorting logic
  const sortedAuctions = React.useMemo(() => {
    let sorted = [...auctions];
    if (sortBy === "date-ascending") {
      sorted.sort((a, b) => new Date(a.auction_date || "1970-01-01") - new Date(b.auction_date || "1970-01-01"));
    } else if (sortBy === "date-descending") {
      sorted.sort((a, b) => new Date(b.auction_date || "1970-01-01") - new Date(a.auction_date || "1970-01-01"));
    } else if (sortBy === "title") {
      sorted.sort((a, b) => a.auction_title.localeCompare(b.auction_title));
    }
    return sorted;
  }, [auctions, sortBy]);

  // Filter by date and search query
  const filteredAuctions = React.useMemo(() => {
    let filtered = sortedAuctions;

    // Filter by date
    if (auctionDate) {
      filtered = filtered.filter(
        (auction) =>
          auction.auction_date &&
          new Date(auction.auction_date).toISOString().split("T")[0] === auctionDate
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((auction) =>
        auction.auction_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [sortedAuctions, auctionDate, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const paginatedAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination button range
  const getPaginationRange = () => {
    const range = [];
    const delta = 2; // Number of pages to show on either side of current page
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (right < totalPages) range.push(totalPages);

    return range;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading auctions...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 mt-[60px] bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 tracking-tight">
          Past Auctions
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Section */}
          <div className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Search Auctions</label>
              <Input
                type="text"
                placeholder="Search by title..."
                className="w-full bg-gray-100"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
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
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Auction Date</label>
              <Input
                type="date"
                className="w-full bg-gray-100"
                value={auctionDate}
                onChange={(e) => {
                  setAuctionDate(e.target.value);
                  setCurrentPage(1); // Reset to first page on date change
                }}
              />
            </div>

            <Button
              variant="secondary"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSortBy("date-ascending");
                setAuctionDate("");
                setSearchQuery(""); // Reset search query
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>

          {/* Auctions Grid */}
          <div className="lg:col-span-3 space-y-6">
            {paginatedAuctions.length > 0 ? (
              paginatedAuctions.map((auction) => (
                <div
                  key={auction.auction_title}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-white border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="sm:col-span-1">
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={auction.image_urls[0] || "/placeholder.svg"}
                        alt={auction.auction_title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors">
                        {auction.auction_title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {auction.auction_date || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {auction.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={
                            auction.auction_status === "Auction Ended"
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {auction.auction_status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                No auctions found for the selected filters.
              </div>
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
                    className={`w-10 h-10 p-0 text-sm font-medium ${
                      page === "..." ? "cursor-default hover:bg-transparent" : ""
                    }`}
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
      <Footer />
    </>
  );
}