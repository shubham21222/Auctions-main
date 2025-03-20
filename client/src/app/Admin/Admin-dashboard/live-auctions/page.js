"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import Image from "next/image";
import config from "@/app/config_BASE_URL";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const AdminLiveAuctionPage = () => {
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth._id);
  const { socket, liveAuctions, joinAuction, getAuctionData, notifications, sendMessage, performAdminAction } = useSocket();
  const [currentAuction, setCurrentAuction] = useState(null);
  const [auctions, setAuctions] = useState([]); // All auctions
  const [upcomingLots, setUpcomingLots] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [competingBids, setCompetingBids] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalLots, setTotalLots] = useState(0);
  const [currentLotIndex, setCurrentLotIndex] = useState(0);
  const [watchers, setWatchers] = useState(0);

  // Fetch all auctions
  const fetchAuctionData = useCallback(async () => {
    if (!token) {
      toast.error("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all auctions
      const auctionResponse = await fetch(`${config.baseURL}/v1/api/auction/all`, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      if (!auctionResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionData = await auctionResponse.json();
      if (auctionData.status && auctionData.items && Array.isArray(auctionData.items.formattedAuctions)) {
        const auctionsList = auctionData.items.formattedAuctions;
        setAuctions(auctionsList);

        // Filter for live auctions only (status: ACTIVE, auctionType: LIVE)
        const liveAuctions = auctionsList.filter(
          (auction) => auction.status === "ACTIVE" && auction.auctionType === "LIVE"
        );

        // Set total lots (considering only live auctions)
        setTotalLots(liveAuctions.length);

        // Find the current live auction (first active LIVE auction)
        const activeAuction = liveAuctions[0]; // First active live auction
        if (activeAuction) {
          setCurrentAuction(activeAuction);
          setBidHistory(activeAuction.bids || []);
          setCompetingBids(
            activeAuction.bids
              ? activeAuction.bids
                  .slice(-7)
                  .map((bid) => ({ amount: bid.bidAmount, label: "Competing Bid" }))
              : []
          );
          setCurrentLotIndex(
            liveAuctions.findIndex((auction) => auction._id === activeAuction._id) + 1
          );

          // Fetch detailed auction data via socket
          getAuctionData(activeAuction._id);
        } else {
          setCurrentAuction(null);
          setBidHistory([]);
          setCompetingBids([]);
          setCurrentLotIndex(0);
        }

        // Filter upcoming lots (live auctions that haven't started yet)
        const upcoming = liveAuctions.filter(
          (auction) =>
            new Date(auction.startDate) > new Date() &&
            auction._id !== activeAuction?._id
        );
        setUpcomingLots(upcoming);
      } else {
        throw new Error("No auction data returned or invalid format");
      }
    } catch (error) {
      console.error("Error fetching auction data:", error);
      toast.error("Failed to fetch auctions: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [token, getAuctionData]);

  useEffect(() => {
    fetchAuctionData();
  }, [fetchAuctionData]);

  // Join the auction room via WebSocket
  useEffect(() => {
    if (currentAuction?.auctionType === "LIVE" && socket) {
      joinAuction(currentAuction._id);
    }
  }, [socket, currentAuction, joinAuction]);

  // Listen for WebSocket updates
  useEffect(() => {
    if (!socket) return;

    socket.on("auctionData", (data) => {
      if (data.auctionId === currentAuction?._id) {
        setCurrentAuction((prev) => ({ ...prev, ...data }));
        setBidHistory(data.bids || []);
        setCompetingBids(
          data.bids
            ? data.bids
                .slice(-7)
                .map((bid) => ({ amount: bid.bidAmount, label: "Competing Bid" }))
            : []
        );
      }
    });

    socket.on("bidUpdate", ({ auctionId, bidAmount, bidderId, bids }) => {
      if (auctionId === currentAuction?._id) {
        setCurrentAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          currentBidder: bidderId,
          bids: bids || prev.bids,
        }));
        setBidHistory((prev) => [...prev, { bidder: bidderId, bidAmount, bidTime: new Date() }]);
        setCompetingBids((prev) => {
          const newBid = { amount: bidAmount, label: "Competing Bid" };
          return [...prev, newBid].slice(-7);
        });
      }
    });

    socket.on("watcherUpdate", ({ auctionId, watchers }) => {
      if (auctionId === currentAuction?._id) {
        setWatchers(watchers);
      }
    });

    socket.on("auctionEnded", ({ auctionId, winner, message }) => {
      if (auctionId === currentAuction?._id) {
        setCurrentAuction((prev) => ({ ...prev, status: "ENDED", winner }));
        setBidHistory((prev) => [
          ...prev,
          { message: `Lot ${currentAuction.lotNumber} closed.`, bidTime: new Date() },
        ]);
      }
      fetchAuctionData();
    });

    socket.on("auctionMessage", ({ auctionId, actionType }) => {
      if (auctionId === currentAuction?._id) {
        setBidHistory((prev) => [
          ...prev,
          { message: `Admin: ${actionType}`, bidTime: new Date() },
        ]);
      }
    });

    return () => {
      socket.off("auctionData");
      socket.off("bidUpdate");
      socket.off("watcherUpdate");
      socket.off("auctionEnded");
      socket.off("auctionMessage");
    };
  }, [socket, currentAuction, fetchAuctionData]);

  // Admin actions (Fair Warning, Final Call, etc.)
  const handleAdminAction = async (actionType) => {
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }

    try {
      // Use the new performAdminAction function
      performAdminAction(currentAuction._id, actionType);

      // If the action ends the auction, emit endAuction and update status via API
      if (actionType === "SOLD" || actionType === "PASS") {
        socket.emit("endAuction", { auctionId: currentAuction._id });

        // Update auction status to ENDED via API
        const payload = {
          product: currentAuction.product._id,
          startingBid: currentAuction.startingBid,
          auctionType: currentAuction.auctionType,
          startDate: new Date(currentAuction.startDate).toISOString(),
          endDate: new Date(currentAuction.endDate).toISOString(),
          category: currentAuction.category._id,
          status: "ENDED",
        };

        const response = await fetch(`${config.baseURL}/v1/api/auction/update/${currentAuction._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update auction status");
        toast.success(`Auction ${actionType.toLowerCase()} successfully!`);
      } else if (actionType === "NEXT_LOT") {
        // Fetch the next auction
        fetchAuctionData();
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast.error(`Error performing ${actionType}: ${error.message}`);
    }
  };

  // Send message via socket
  const handleSendMessage = () => {
    if (!message || !currentAuction) {
      toast.error("Please enter a message and ensure an auction is selected.");
      return;
    }

    try {
      // Use the new sendMessage function
      sendMessage(currentAuction._id, message);
      
      // Add the message to local bid history immediately
      setBidHistory((prev) => [
        ...prev,
        { message: `Admin: ${message}`, bidTime: new Date() },
      ]);
      
      setMessage("");
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LIVE AUCTIONEERS</h1>
              <p className="text-gray-600">NY ELIZABETH</p>
            </div>
            <div className="flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Lot {currentLotIndex} of {totalLots} | {totalLots > 0 ? Math.round(((totalLots - currentLotIndex) / totalLots) * 100) : 0}% Remaining
                </p>
                <p className="text-sm text-gray-600">Online: {watchers}</p>
              </div>
              <Button
                onClick={fetchAuctionData}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              >
                Refresh Auctions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Live Auction</h2>
        {currentAuction ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Section: Product and Upcoming Lots */}
            <div className="lg:col-span-5 space-y-6">
              {/* Current Lot Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        LOT: {currentAuction?.lotNumber || "N/A"}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">
                        {currentAuction?.product?.title || "HERMES H HEURE WOMEN'S WATCH"}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Brand</p>
                      <p className="font-semibold text-gray-900">{currentAuction?.product?.brand || "HERMES"}</p>
                    </div>
                  </div>
                  <div className="relative w-full h-72 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={currentAuction?.product?.image || "/placeholder.svg"}
                      alt={currentAuction?.product?.title || "Product Image"}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Estimate</p>
                      <p className="font-semibold text-gray-900">
                        ${currentAuction?.startingBid || 1650} - ${(currentAuction?.startingBid || 1650) + 1000}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Bid</p>
                      <p className="font-semibold text-blue-600">
                        ${currentAuction?.currentBid?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Lots */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Lots</h3>
                  {upcomingLots.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingLots.slice(0, 4).map((lot) => (
                        <div key={lot._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                          <div className="w-12 h-12 relative rounded-md overflow-hidden">
                            <Image
                              src={lot.product?.image || "/placeholder.svg"}
                              alt={lot.product?.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Lot {lot.lotNumber}</p>
                            <p className="text-xs text-gray-600">{lot.product?.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No upcoming lots available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Bids and Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Competing Bids */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Competing Bids</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {competingBids.length > 0 ? (
                      competingBids.map((bid, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Bid {index + 1}</p>
                          <p className="font-semibold text-gray-900">${bid.amount.toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 col-span-full">No competing bids yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bid History */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid History</h3>
                  <div className="h-64 overflow-y-auto space-y-2">
                    {bidHistory.length > 0 ? (
                      bidHistory.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <p className="text-sm">
                              {entry.message ? (
                                <span className="text-blue-600 font-medium">{entry.message}</span>
                              ) : (
                                <span className="text-gray-900">
                                  ${entry.bidAmount?.toLocaleString()} - Bidder {entry.bidder?.name || entry.bidder?._id || "Unknown"}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.bidTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No bids yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Controls */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Controls</h3>
                  <div className="space-y-4">
                    {/* Warning Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAdminAction("FAIR_WARNING")}
                        className="flex-1 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200"
                        disabled={currentAuction?.status === "ENDED"}
                      >
                        Fair Warning
                      </Button>
                      <Button
                        onClick={() => handleAdminAction("FINAL_CALL")}
                        className="flex-1 bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200"
                        disabled={currentAuction?.status === "ENDED"}
                      >
                        Final Call
                      </Button>
                    </div>

                    {/* Status and Action Buttons */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={currentAuction?.currentBid || 0}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAdminAction("SOLD")}
                          className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                          disabled={currentAuction?.status === "ENDED"}
                        >
                          Sold
                        </Button>
                        <Button
                          onClick={() => handleAdminAction("PASS")}
                          className="bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                          disabled={currentAuction?.status === "ENDED"}
                        >
                          Pass
                        </Button>
                        <Button
                          onClick={() => handleAdminAction("NEXT_LOT")}
                          className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                        >
                          Next Lot
                        </Button>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active live auction found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;