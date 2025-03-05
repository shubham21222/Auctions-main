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
          setAuctions(result.items);
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
    const isEnded = auction.status === "ENDED";
    const currentTime = new Date();
    const endDate = new Date(auction.endDate);
    const isActive = !isEnded && currentTime < endDate;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{auction.product.title}</h3>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Lot Number:</span> {auction.lotNumber}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Starting Bid:</span> ${auction.startingBid.toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Current Bid:</span> ${auction.currentBid.toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Start Date:</span>{" "}
          {new Date(auction.startDate).toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">End Date:</span> {new Date(auction.endDate).toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`${
              isActive ? "text-green-600" : "text-red-600"
            } font-semibold`}
          >
            {auction.status}
          </span>
        </p>
        {auction.currentBidder && (
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Current Bidder:</span>{" "}
            {auction.currentBidder.name} ({auction.currentBidder.email})
          </p>
        )}
        <p className="text-gray-600">
          <span className="font-medium">Product Price:</span> ${auction.product.price.toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-b mt-6 from-gray-50 to-gray-100 py-12 px-4">
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
            <p className="text-xl text-gray-600">You haven’t participated in any auctions yet.</p>
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