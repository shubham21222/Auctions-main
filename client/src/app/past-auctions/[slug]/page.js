"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import config from "@/app/config_BASE_URL";
import { format } from "date-fns";
import { formatPriceWithCurrency, formatEstimatePrice } from "@/utils/priceFormatter";

const AuctionDetailsPage = () => {
  const { id } = useParams(); // Get auction ID from URL
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAuctions = async () => {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulk?status=ENDED`);
        if (!response.ok) throw new Error("Failed to fetch auctions");
        const data = await response.json();

        if (data.status && data.items?.catalogs) {
          // Find the specific auction by ID
          const allAuctions = data.items.catalogs.flatMap(catalog => catalog.auctions);
          const foundAuction = allAuctions.find(auction => auction._id === id);

          if (foundAuction) {
            setAuction(foundAuction);
          } else {
            throw new Error("Auction not found");
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 text-xl animate-pulse">Loading...</div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-500 text-xl">Error: {error}</div>
    );
  if (!auction)
    return (
      <div className="text-center py-20 text-gray-500 text-xl">Auction not found</div>
    );

  return (
    <>
      <Header />
      <div className="container mt-8 mx-auto py-16 px-6 min-h-screen">
        {/* Auction Title with Animation */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="md:text-5xl text-xl font-extrabold text-gray-900 mb-12 text-center tracking-tight drop-shadow-md"
        >
          {auction.product?.title || "Auction Details"}
        </motion.h1>

        {/* Product Images */}
        {auction.product?.image && auction.product.image.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auction.product.image.map((image, index) => (
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
          </motion.div>
        )}

        {/* Auction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
            <p><strong className="text-gray-900">Lot Number:</strong> {auction.lotNumber}</p>
            <p><strong className="text-gray-900">Starting Bid:</strong> {formatPriceWithCurrency(auction.startingBid, true)}</p>
            <p><strong className="text-gray-900">Current Bid:</strong> {formatPriceWithCurrency(auction.currentBid, true)}</p>
            <p><strong className="text-gray-900">Reserve Price:</strong> {formatPriceWithCurrency(auction.product?.ReservePrice || 0, true)}</p>
            <p><strong className="text-gray-900">Estimate Price:</strong> ${formatEstimatePrice(auction.product?.estimateprice)}</p>
            <p><strong className="text-gray-900">Winner:</strong> {auction.winner?.name || "No winner"}</p>
            <p><strong className="text-gray-900">Winning Time:</strong> {auction.winnerBidTime ? format(new Date(auction.winnerBidTime), "PPp") : "N/A"}</p>
            <p><strong className="text-gray-900">Payment Status:</strong>{" "}
              <span className={auction.payment_status === "PAID" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {auction.payment_status || "PENDING"}
              </span>
            </p>
            <p><strong className="text-gray-900">Shipping Status:</strong>{" "}
              <span className={auction.shipping_status === "SHIPPED" ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
                {auction.shipping_status || "PENDING"}
              </span>
            </p>
          </div>
          <div className="mt-6 text-gray-600 leading-relaxed">
            <strong className="text-gray-900">Description:</strong>
            <div className="mt-2" dangerouslySetInnerHTML={{ __html: auction.description || "No description available" }} />
          </div>
        </motion.div>

        {/* Bid History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(auction.bids || []).map((bid, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(auction.bids || []).length - index}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${bid.bidAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.bidTime ? format(new Date(bid.bidTime), "PPp") : "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.bidder?.name || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bid Logs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid Logs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message/Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(auction.bidLogs || []).map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(auction.bidLogs || []).length - index}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.msg || `$${log.bidAmount}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.bidTime ? format(new Date(log.bidTime), "PPp") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.bidder?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default AuctionDetailsPage;