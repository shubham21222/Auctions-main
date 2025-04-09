"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserAuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from Redux store
  const token = useSelector((state) => state.auth.token);

  const fetchProductDetails = async (auctionId) => {
    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/bulkgetbyId/${auctionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.status) {
        return result.items[0]?.product || null;
      }
      return null;
    } catch (err) {
      console.error("Error fetching product details:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserAuctions = async () => {
      if (!token) {
        toast.error("Please log in to view your participated auctions.");
        setError("Authentication required.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/getUserAuctions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });

        const result = await response.json();
        if (response.ok && result.status) {
          // Fetch product details for auctions that don't have product information
          const auctionsWithProducts = await Promise.all(
            result.items.map(async (auction) => {
              if (!auction.product && auction._id) {
                const productDetails = await fetchProductDetails(auction._id);
                return { ...auction, product: productDetails };
              }
              return auction;
            })
          );
          setAuctions(auctionsWithProducts);
          toast.success("Your participated auctions have been loaded!");
        } else {
          throw new Error(result.message || "Failed to fetch auctions.");
        }
      } catch (err) {
        console.error("Error fetching user auctions:", err);
        setError(err.message || "An error occurred while fetching your auctions.");
        toast.error(err.message || "Failed to load auctions.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAuctions();
  }, [token]);

  const AuctionCard = ({ auction }) => {
    const isEnded = auction?.status === "ENDED";
    const currentTime = new Date();
    const endDate = new Date(auction?.endDate || new Date());
    const isActive = !isEnded && currentTime < endDate;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        {auction?.product?.image?.[0] && (
          <div className="mb-4">
            <img
              src={auction.product.image[0]}
              alt={auction?.product?.title || 'Product'}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {auction?.product?.title || 'Untitled Product'}
        </h3>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Lot Number:</span> {auction?.lotNumber || 'N/A'}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Starting Bid:</span> ${(auction?.startingBid || 0).toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Current Bid:</span> ${(auction?.currentBid || 0).toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Start Date:</span>{" "}
          {auction?.startDate ? new Date(auction.startDate).toLocaleString() : 'N/A'}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">End Date:</span>{" "}
          {auction?.endDate ? new Date(auction.endDate).toLocaleString() : 'N/A'}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`${
              isActive ? "text-green-600" : "text-red-600"
            } font-semibold`}
          >
            {auction?.status || 'UNKNOWN'}
          </span>
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Auction Type:</span>{" "}
          <span className="font-semibold">
            {auction?.auctionType || 'N/A'}
          </span>
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Payment Status:</span>{" "}
          <span className={`font-semibold ${
            auction?.payment_status === 'PAID' ? 'text-green-600' : 
            auction?.payment_status === 'FAILED' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {auction?.payment_status || 'N/A'}
          </span>
        </p>
        {auction?.currentBidder && (
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Current Bidder:</span>{" "}
            {auction.currentBidder.name || 'Anonymous'} ({auction.currentBidder.email || 'No email'})
          </p>
        )}
        <p className="text-gray-600">
          <span className="font-medium">Product Price:</span> ${(auction?.product?.price || 0).toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen mt-8 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Participated Auctions
          </h1>

          {loading ? (
            <div className="text-center">
              <p className="text-xl text-gray-600 animate-pulse">Loading your auctions...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-xl text-red-600">{error}</p>
              <p className="text-gray-500 mt-2">Please log in or try again later.</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-xl text-gray-600">You haven't participated in any auctions yet.</p>
              <p className="text-gray-500 mt-2">Start bidding to see your auctions here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserAuctionsPage;