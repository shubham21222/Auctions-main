'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

const auctions = [
  {
    id: 1,
    title: "Bohemian Glass and European Antiques & Cars",
    date: "April 14th, 2024",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/08/8460-2.jpeg",
  },
  {
    id: 2,
    title: "European & Decorative Arts And More!",
    date: "May 1st, 2024",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/08/8459-2.jpeg",
  },
  {
    id: 3,
    title: "Multi Estate Art, Jewelry, & Cars UK-USA",
    date: "May 8th, 2024",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/08/8458-1.jpeg",
  },
];

export default function PastAuctions() {
  const [sortBy, setSortBy] = React.useState("date-ascending");
  const [auctionDate, setAuctionDate] = React.useState("");

  // Sorting logic
  const sortedAuctions = React.useMemo(() => {
    let sorted = [...auctions];
    if (sortBy === "date-ascending") {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "date-descending") {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [sortBy]);

  // Filter by date
  const filteredAuctions = React.useMemo(() => {
    if (!auctionDate) return sortedAuctions;
    return sortedAuctions.filter(
      (auction) => new Date(auction.date).toISOString().split("T")[0] === auctionDate
    );
  }, [sortedAuctions, auctionDate]);

  return (
    <>
    <Header />
    <div className="container mt-[60px] mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Past Auctions</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Section */}
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Sort By</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-ascending">Date: Ascending</SelectItem>
                <SelectItem value="date-descending">Date: Descending</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Auction Date</label>
            <Input
              type="date"
              className="w-full"
              value={auctionDate}
              onChange={(e) => setAuctionDate(e.target.value)}
            />
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSortBy("date-ascending");
              setAuctionDate("");
            }}
          >
            Reset Filters
          </Button>
        </div>

        {/* Auctions Grid */}
        <div className="md:col-span-3 space-y-4">
          {filteredAuctions.length > 0 ? (
            filteredAuctions.map((auction) => (
              <div
                key={auction.id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out"
              >
                <div className="sm:col-span-1">
                  <div className="aspect-square relative rounded-md overflow-hidden">
                    <Image
                      src={auction.image || "/placeholder.svg"}
                      alt={auction.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{auction.title}</h3>
                    <p className="text-sm text-gray-500">{auction.date}</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Result</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No auctions found for the selected filters.
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-8">
            {[1, 2, 3, "...", 67, 68, 69].map((page, index) => (
              <Button
                key={index}
                variant={page === 1 ? "default" : "outline"}
                className="w-10 h-10 p-0 text-sm font-medium"
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}