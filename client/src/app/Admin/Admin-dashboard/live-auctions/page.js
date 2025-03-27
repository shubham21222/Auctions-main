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
  const { socket, joinAuction, getAuctionData, sendMessage, performAdminAction, updateAuctionMode, auctionModes } = useSocket();
  const [currentAuction, setCurrentAuction] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [upcomingLots, setUpcomingLots] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
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
    if (typeof window === "undefined") return;
    fetchAuctionData();
  }, [fetchAuctionData]);

  // Ensure the client joins the auction room as soon as socket and currentAuction are ready
  useEffect(() => {
    if (!socket) {
      console.log("Socket not ready yet");
      return;
    }
    if (!currentAuction || currentAuction.auctionType !== "LIVE") {
      console.log("No current auction or not a LIVE auction:", { currentAuction });
      return;
    }

    console.log("Joining auction room for auction:", currentAuction._id);
    joinAuction(currentAuction._id);
    getAuctionData(currentAuction._id);
  }, [socket, currentAuction, joinAuction, getAuctionData]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !currentAuction || currentAuction.auctionType !== "LIVE") return;

    const handleAuctionData = (data) => {
      if (data.auctionId === currentAuction._id) {
        setCurrentAuction((prev) => ({ ...prev, ...data }));
        setBidHistory(data.bids || []);
      }
    };

    const handleBidUpdate = ({ auctionId, bidAmount, bidderId, bids, bidType }) => {
      if (auctionId === currentAuction._id) {
        setCurrentAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          currentBidder: bidderId,
          bids: bids || prev.bids,
        }));
        setBidHistory((prev) => {
          const newHistory = [...prev, { bidder: bidderId, bidAmount, bidTime: new Date(), bidType }];
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

    const handleAuctionMessage = ({ auctionId, actionType, message }) => {
      if (auctionId === currentAuction._id) {
        setBidHistory((prev) => [
          ...prev,
          { message: message || actionType, bidTime: new Date() },
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
  }, [socket, currentAuction, fetchAuctionData]);

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
        { message: message, bidTime: new Date() },
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
      setCurrentLotIndex(0);
      return;
    }
    setCurrentAuction(auction);
    setBidHistory(auction.bids || []);
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">NY Elizabeth</h1>
              <div className="flex items-center gap-2 text-sm">
                <span>NY Elizabeth</span>
                {/* <span className="text-blue-400">25TR</span>
                <span>Georg Jensen & More! Day 1</span> */}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                {currentLotIndex} of {totalLots} Lots Remaining
              </div>
              <div className="text-sm">
                {totalLots > 0 ? Math.round(((totalLots - currentLotIndex) / totalLots) * 100) : 0}%
              </div>
              <div className="text-sm">Online: {watchers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <AuctionSelector 
          auctions={auctions} 
          onAuctionSelect={handleAuctionSelect} 
          selectedAuction={currentAuction} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Left Column - Auction Details */}
          <div>
            <AuctionDetails 
              currentAuction={currentAuction} 
              upcomingLots={upcomingLots} 
            />
          </div>
          
          {/* Right Column - Auction Controls */}
          <div>
            <AuctionControls
              currentAuction={currentAuction}
              bidHistory={bidHistory}
              handleAdminAction={handleAdminAction}
              handleSendMessage={handleSendMessage}
              message={message}
              setMessage={setMessage}
              watchers={watchers}
              socket={socket}
              setAuctionMode={updateAuctionMode}
              auctionMode={currentAuction ? auctionModes[currentAuction._id] || "online" : "online"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;