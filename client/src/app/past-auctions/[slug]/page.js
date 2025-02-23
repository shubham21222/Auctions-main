"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion"; // Import framer-motion
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const AuctionDetailsPage = () => {
  const { slug } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchAuctionData = async () => {
      try {
        const response = await fetch("/api/auctions");
        if (!response.ok) throw new Error("Failed to fetch auctions");
        const data = await response.json();

        console.log("All auction titles:", data.map((a) => a.auction_title));
        console.log("URL slug:", slug);

        const matchedAuction = data.find(
          (a) => a.auction_title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
        );

        setAuction(matchedAuction || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, [slug]);

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
    <div className="container mt-8 mx-auto py-16 px-6  min-h-screen">
      {/* Auction Title with Animation */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="md:text-5xl text-xl font-extrabold text-gray-900 mb-12 text-center tracking-tight drop-shadow-md"
      >
        {auction.auction_title}
      </motion.h1>

      {/* Auction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
          <p><strong className="text-gray-900">Seller:</strong> {auction.seller_name}</p>
          <p><strong className="text-gray-900">Date:</strong> {auction.auction_date}</p>
          <p><strong className="text-gray-900">Location:</strong> {auction.location}</p>
          <p>
            <strong className="text-gray-900">Status:</strong>{" "}
            <span className={auction.auction_status === "Auction Ended" ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
              {auction.auction_status}
            </span>
          </p>
        </div>
        <p className="mt-6 text-gray-600 leading-relaxed"><strong className="text-gray-900">Description:</strong> {auction.description}</p>
      </motion.div>

      {/* Items Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {auction.items.length > 0 ? (
          auction.items.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-[600px]" // Increased height
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="relative h-[400px] w-full rounded-md overflow-hidden mb-4 flex-shrink-0"> {/* Adjusted image height */}
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.item_name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">{item.item_name}</h3>
                  <p className="text-sm text-gray-600 mb-2"><strong>Estimate:</strong> {item.price_estimate}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Status:</strong>{" "}
                    <span className={item.sold_status === "Sold" ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                      {item.sold_status}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-600"><strong>Sold Price:</strong> {item.sold_price}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full text-lg py-10">
            No items found for this auction.
          </p>
        )}
      </motion.div>
    </div>
    <Footer />
    </>
  );
};

export default AuctionDetailsPage;