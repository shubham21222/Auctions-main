"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import config from "@/app/config_BASE_URL";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import AuctionSelector from "./AuctionSelector";
import AuctionDetails from "./AuctionDetails";
import AuctionControls from "./AuctionControls";

const AdminLiveAuctionPage = () => {
  const token = useSelector((state) => state.auth.token);
  const { socket, joinAuction, getAuctionData, sendMessage, performAdminAction } = useSocket();
  const [currentAuction, setCurrentAuction] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [upcomingLots, setUpcomingLots] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [competingBids, setCompetingBids] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalLots, setTotalLots] = useState(0);
  const [currentLotIndex, setCurrentLotIndex] = useState(0);
  const [watchers, setWatchers] = useState(0);

  const fetchAuctionData = useCallback(async () => {
    if (!token) {
      toast.error("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const auctionResponse = await fetch(`${config.baseURL}/v1/api/auction/all`, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      if (!auctionResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionData = await auctionResponse.json();
      if (auctionData.status && auctionData.items && Array.isArray(auctionData.items.formattedAuctions)) {
        const auctionsList = auctionData.items.formattedAuctions;
        setAuctions(auctionsList);

        const liveAuctions = auctionsList.filter(
          (auction) => auction.status === "ACTIVE" && auction.auctionType === "LIVE"
        );
        setTotalLots(liveAuctions.length);

        const upcoming = liveAuctions.filter(
          (auction) => new Date(auction.startDate) > new Date()
        );
        setUpcomingLots(upcoming);

        if (currentAuction && !auctionsList.some((a) => a._id === currentAuction._id)) {
          setCurrentAuction(null);
        }
      } else {
        throw new Error("No auction data returned or invalid format");
      }
    } catch (error) {
      console.error("Error fetching auction data:", error);
      toast.error("Failed to fetch auctions: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [token, currentAuction]);

  useEffect(() => {
    if (typeof window === "undefined") return; // Skip on server
    fetchAuctionData();
  }, [fetchAuctionData]);

  useEffect(() => {
    if (!socket || !currentAuction || currentAuction.auctionType !== "LIVE") return;

    joinAuction(currentAuction._id);
    getAuctionData(currentAuction._id);

    const handleAuctionData = (data) => {
      if (data.auctionId === currentAuction._id) {
        setCurrentAuction((prev) => ({ ...prev, ...data }));
        setBidHistory(data.bids || []);
        setCompetingBids(
          data.bids
            ? data.bids.slice(-7).map((bid) => ({ amount: bid.bidAmount, label: "Competing Bid" }))
            : []
        );
      }
    };

    const handleBidUpdate = ({ auctionId, bidAmount, bidderId, bids }) => {
      if (auctionId === currentAuction._id) {
        setCurrentAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          currentBidder: bidderId,
          bids: bids || prev.bids,
        }));
        setBidHistory((prev) => {
          const newHistory = [...prev, { bidder: bidderId, bidAmount, bidTime: new Date() }];
          setCompetingBids(newHistory.slice(-7).map((bid) => ({
            amount: bid.bidAmount,
            label: "Competing Bid",
          })));
          return newHistory;
        });
      }
    };

    const handleWatcherUpdate = ({ auctionId, watchers }) => {
      if (auctionId === currentAuction._id) {
        setWatchers(watchers);
      }
    };

    const handleAuctionEnded = ({ auctionId }) => {
      if (auctionId === currentAuction._id) {
        setCurrentAuction((prev) => ({ ...prev, status: "ENDED" }));
      }
      fetchAuctionData();
    };

    const handleAuctionMessage = ({ auctionId, actionType }) => {
      if (auctionId === currentAuction._id) {
        setBidHistory((prev) => [
          ...prev,
          { message: `Admin: ${actionType}`, bidTime: new Date() },
        ]);
      }
    };

    socket.on("auctionData", handleAuctionData);
    socket.on("bidUpdate", handleBidUpdate);
    socket.on("watcherUpdate", handleWatcherUpdate);
    socket.on("auctionEnded", handleAuctionEnded);
    socket.on("auctionMessage", handleAuctionMessage);

    return () => {
      socket.off("auctionData", handleAuctionData);
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("watcherUpdate", handleWatcherUpdate);
      socket.off("auctionEnded", handleAuctionEnded);
      socket.off("auctionMessage", handleAuctionMessage);
    };
  }, [socket, currentAuction?._id, joinAuction, getAuctionData, fetchAuctionData]);

  const handleAdminAction = async (actionType) => {
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }

    try {
      performAdminAction(currentAuction._id, actionType);
      if (actionType === "SOLD" || actionType === "PASS") {
        socket.emit("endAuction", { auctionId: currentAuction._id });
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
        fetchAuctionData();
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast.error(`Error performing ${actionType}: ${error.message}`);
    }
  };

  const handleSendMessage = () => {
    if (!message || !currentAuction) {
      toast.error("Please enter a message and ensure an auction is selected.");
      return;
    }

    try {
      sendMessage(currentAuction._id, message);
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

  const handleAuctionSelect = (auction) => {
    if (!auction) {
      setCurrentAuction(null);
      setBidHistory([]);
      setCompetingBids([]);
      setCurrentLotIndex(0);
      return;
    }
    setCurrentAuction(auction);
    setBidHistory(auction.bids || []);
    setCompetingBids(
      auction.bids
        ? auction.bids.slice(-7).map((bid) => ({ amount: bid.bidAmount, label: "Competing Bid" }))
        : []
    );
    setCurrentLotIndex(
      auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE").findIndex(
        (a) => a._id === auction._id
      ) + 1
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">LIVE AUCTIONEERS</h1>
            <p className="text-gray-600 text-sm">NY ELIZABETH</p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-right">
              <p className="text-xs text-gray-600">
                Lot {currentLotIndex} of {totalLots} |{" "}
                {totalLots > 0 ? Math.round(((totalLots - currentLotIndex) / totalLots) * 100) : 0}% Remaining
              </p>
              <p className="text-xs text-gray-600">Online: {watchers}</p>
            </div>
            <Button
              onClick={fetchAuctionData}
              className="bg-blue-600 text-white hover:bg-blue-700 text-sm py-1 px-3"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <AuctionSelector auctions={auctions} onAuctionSelect={handleAuctionSelect} selectedAuction={currentAuction} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <AuctionDetails currentAuction={currentAuction} upcomingLots={upcomingLots} />
          </div>
          <div className="lg:col-span-7">
            <AuctionControls
              currentAuction={currentAuction}
              bidHistory={bidHistory}
              competingBids={competingBids}
              handleAdminAction={handleAdminAction}
              handleSendMessage={handleSendMessage}
              message={message}
              setMessage={setMessage}
              watchers={watchers}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;