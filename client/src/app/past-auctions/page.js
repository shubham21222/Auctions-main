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
import config from "@/app/config_BASE_URL";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch API data
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulk?status=ENDED`);
        if (!response.ok) throw new Error("Failed to fetch auctions");
        const data = await response.json();

        // Fetch scraped data
        const scrapedResponse = await fetch('/scraped_auction_data.json');
        const scrapedData = await scrapedResponse.json();

        if (data.status && data.items?.catalogs) {
          // Process API data
          const apiAuctions = data.items.catalogs.flatMap(catalog => 
            (catalog.auctions || []).map(auction => ({
              ...auction,
              catalogName: catalog.catalogName,
              product: auction.product || { title: "Untitled Item", image: [""] },
              source: 'api'
            }))
          );

          // Process scraped data
          const processedScrapedAuctions = scrapedData.flatMap(auction => 
            auction.items.map(item => ({
              _id: `scraped-${item.item_name}`,
              title: item.item_name,
              product: {
                title: item.item_name,
                image: [item.image_url],
                description: item.image_alt,
                estimateprice: item.price_estimate
              },
              lotNumber: item.item_name.split(':')[0],
              currentBid: item.sold_price === "See Sold Price" ? "Sold" : item.sold_price,
              winnerBidTime: auction.auction_date,
              endDate: auction.auction_date,
              status: "ENDED",
              source: 'scraped',
              catalogName: auction.auction_title,
              location: auction.location
            }))
          );

          // Combine both data sources
          setAuctions([...apiAuctions, ...processedScrapedAuctions]);
          setScrapedAuctions(processedScrapedAuctions);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedAuctions = React.useMemo(() => {
    let sorted = [...auctions];
    if (sortBy === "date-ascending") {
      sorted.sort((a, b) => new Date(a.winnerBidTime || a.endDate) - new Date(b.winnerBidTime || b.endDate));
    } else if (sortBy === "date-descending") {
      sorted.sort((a, b) => new Date(b.winnerBidTime || b.endDate) - new Date(a.winnerBidTime || a.endDate));
    } else if (sortBy === "title") {
      sorted.sort((a, b) => (a.product?.title || "").localeCompare(b.product?.title || ""));
    }
    return sorted;
  }, [auctions, sortBy]);

  const filteredAuctions = React.useMemo(() => {
    let filtered = sortedAuctions;
    if (auctionDate) {
      filtered = filtered.filter(
        (auction) =>
          auction.winnerBidTime &&
          new Date(auction.winnerBidTime).toISOString().split("T")[0] === auctionDate
      );
    }
    if (searchQuery) {
      filtered = filtered.filter((auction) =>
        (auction.product?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [sortedAuctions, auctionDate, searchQuery]);

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const paginatedAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  if (loading) return <div className="text-center py-10 text-gray-500">Loading auctions...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 mt-[60px]  min-h-screen">
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
                  setCurrentPage(1);
                }}
              />
            </div>

            <Button
              variant="secondary"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSortBy("date-descending");
                setAuctionDate("");
                setSearchQuery("");
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
                  key={auction._id}
                  onClick={() => handleAuctionClick(auction)}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-white border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="sm:col-span-1">
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={auction.product?.image?.[0] || "/placeholder.svg"}
                        alt={auction.product?.title || "Auction item"}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors">
                        {auction.product?.title || "Untitled Item"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Lot Number:</span> {auction.lotNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ended:</span> {format(new Date(auction.winnerBidTime || auction.endDate), "PPp")}
                      </p>
                      {auction.source === 'api' && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Winner:</span> {auction.winner ? (typeof auction.winner === 'string' ? auction.winner : auction.winner.name) : "No winner"}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Final Bid:</span> {auction.currentBid}
                      </p>
                      {auction.location && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Location:</span> {auction.location}
                        </p>
                      )}
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

      {/* Auction Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedAuction?.product?.title || "Auction Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedAuction && (
            <div className="space-y-6">
              {/* Product Images */}
              {selectedAuction.product?.image && selectedAuction.product.image.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedAuction.product.image.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Auction Details */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
                  <p><strong className="text-gray-900">Lot Number:</strong> {selectedAuction.lotNumber}</p>
                  {selectedAuction.source === 'api' && (
                    <>
                      <p><strong className="text-gray-900">Starting Bid:</strong> ${selectedAuction.startingBid}</p>
                      <p><strong className="text-gray-900">Current Bid:</strong> ${selectedAuction.currentBid}</p>
                      <p><strong className="text-gray-900">Reserve Price:</strong> ${selectedAuction.product?.ReservePrice || 0}</p>
                    </>
                  )}
                  <p><strong className="text-gray-900">Estimate Price:</strong> {selectedAuction.product?.estimateprice || "N/A"}</p>
                  {selectedAuction.source === 'api' && (
                    <p><strong className="text-gray-900">Winner:</strong> {selectedAuction.winner ? (typeof selectedAuction.winner === 'string' ? selectedAuction.winner : selectedAuction.winner.name) : "No winner"}</p>
                  )}
                  <p><strong className="text-gray-900">Winning Time:</strong> {selectedAuction.winnerBidTime ? format(new Date(selectedAuction.winnerBidTime), "PPp") : "N/A"}</p>
                  {selectedAuction.location && (
                    <p><strong className="text-gray-900">Location:</strong> {selectedAuction.location}</p>
                  )}
                </div>
                <div className="mt-6 text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">Description:</strong>
                  <div className="mt-2" dangerouslySetInnerHTML={{ __html: selectedAuction.product?.description || "No description available" }} />
                </div>
              </div>

              {/* Bid History - Only for API data */}
              {selectedAuction.source === 'api' && selectedAuction.bids && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid History</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(selectedAuction.bids || []).map((bid, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(selectedAuction.bids || []).length - index}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${bid.bidAmount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.bidTime ? format(new Date(bid.bidTime), "PPp") : "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}