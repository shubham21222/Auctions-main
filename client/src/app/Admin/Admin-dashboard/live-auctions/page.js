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
  const { socket, liveAuctions, joinAuction, getAuctionData, notifications } = useSocket();
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
      // Emit via WebSocket
      socket.emit("adminAction", { auctionId: currentAuction._id, actionType });

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

    socket.emit("sendMessage", { auctionId: currentAuction._id, message });
    setMessage("");
    toast.success("Message sent successfully!");
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">LIVE AUCTIONEERS</h1>
          <p>NY ELIZABETH</p>
        </div>
        <div>
          <p>
            {currentLotIndex} of {totalLots} Lots |{" "}
            {totalLots > 0
              ? Math.round(((totalLots - currentLotIndex) / totalLots) * 100)
              : 0}% Remaining
          </p>
          <p>Online: {watchers}</p>
          <Button
            onClick={fetchAuctionData}
            className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            Refresh Auctions
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Live Auction Section */}
        <h2 className="text-2xl font-bold mb-4">Current Live Auction</h2>
        {currentAuction ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Section: Product and Upcoming Lots */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">LOT: {currentAuction?.lotNumber || "N/A"}</h2>
                <h3 className="text-xl font-bold">
                  {currentAuction?.product?.title || "HERMES H HEURE WOMEN'S WATCH"}
                </h3>
                <div className="relative w-full h-64">
                  <Image
                    src={currentAuction?.product?.image || "/placeholder.svg"}
                    alt={currentAuction?.product?.title || "Product Image"}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="mt-2">Brand: {currentAuction?.product?.brand || "HERMES"}</p>
                <p>
                  Estimate: ${currentAuction?.startingBid || 1650} - $
                  {(currentAuction?.startingBid || 1650) + 1000}
                </p>
              </div>

              {/* Upcoming Lots */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Upcoming Lots</h3>
                {upcomingLots.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {upcomingLots.slice(0, 4).map((lot) => (
                      <li key={lot._id} className="text-sm">
                        Lot {lot.lotNumber} - {lot.product?.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No upcoming lots available.</p>
                )}
              </div>
            </div>

            {/* Right Section: Competing Bids, Bid History, and Controls */}
            <div className="space-y-4">
              {/* Competing Bids */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Competing Bids</h3>
                {competingBids.length > 0 ? (
                  <ul className="space-y-1 mt-2">
                    {competingBids.map((bid, index) => (
                      <li key={index} className="text-sm">
                        ${bid.amount} ({bid.label})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No competing bids yet.</p>
                )}
              </div>

              {/* Bid History */}
              <div className="bg-white p-4 rounded-lg shadow-md h-48 overflow-y-auto">
                <h3 className="text-lg font-semibold">Bid History</h3>
                {bidHistory.length > 0 ? (
                  <ul className="space-y-1 mt-2">
                    {bidHistory.map((entry, index) => (
                      <li key={index} className="text-sm">
                        {entry.message ? (
                          <span className="text-blue-600">{entry.message}</span>
                        ) : (
                          `$${entry.bidAmount} - Bidder ${entry.bidder?.name || entry.bidder?._id || "Unknown"}`
                        )}{" "}
                        - {new Date(entry.bidTime).toLocaleTimeString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No bids yet.</p>
                )}
              </div>

              {/* Admin Controls */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    onClick={() => handleAdminAction("FAIR_WARNING")}
                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                    disabled={currentAuction?.status === "ENDED"}
                  >
                    Fair Warning
                  </Button>
                  <Button
                    onClick={() => handleAdminAction("FINAL_CALL")}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                    disabled={currentAuction?.status === "ENDED"}
                  >
                    Final Call
                  </Button>
                  <p>Reserve Not Met</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="number"
                    value={currentAuction?.currentBid || 0}
                    readOnly
                    className="w-1/3"
                  />
                  <Button
                    onClick={() => handleAdminAction("SOLD")}
                    className="bg-green-500 text-white hover:bg-green-600"
                    disabled={currentAuction?.status === "ENDED"}
                  >
                    Sold
                  </Button>
                  <Button
                    onClick={() => handleAdminAction("PASS")}
                    className="bg-red-500 text-white hover:bg-red-600"
                    disabled={currentAuction?.status === "ENDED"}
                  >
                    Pass
                  </Button>
                  <Button
                    onClick={() => handleAdminAction("NEXT_LOT")}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Next Lot
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message Text"
                    className="w-3/4"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No active live auction found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;