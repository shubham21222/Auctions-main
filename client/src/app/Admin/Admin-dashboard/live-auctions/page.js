"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import config from "@/app/config_BASE_URL";
import toast from "react-hot-toast";
import CatalogCard from "./CatalogCard";
import AuctionDetails from "./AuctionDetails";
import AuctionControls from "./AuctionControls";

const AdminLiveAuctionPage = () => {
  const token = useSelector((state) => state.auth.token);
  const { socket, joinAuction, getAuctionData, sendMessage, performAdminAction, updateAuctionMode, auctionModes } = useSocket();
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [watchers, setWatchers] = useState(0);

  const fetchAuctionData = useCallback(async () => {
    if (!token) {
      toast.error("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const auctionResponse = await fetch(`${config.baseURL}/v1/api/auction/bulk`, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      if (!auctionResponse.ok) throw new Error("Failed to fetch auctions");
      const auctionData = await auctionResponse.json();
      if (auctionData.status && auctionData.items && Array.isArray(auctionData.items.catalogs)) {
        setCatalogs(auctionData.items.catalogs);
      } else {
        throw new Error("No catalog data returned or invalid format");
      }
    } catch (error) {
      console.error("Error fetching auction data:", error);
      toast.error("Failed to fetch catalogs: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetchAuctionData();
  }, [fetchAuctionData]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !currentAuction) return;

    const handleWatcherUpdate = ({ auctionId, watchers }) => {
      if (auctionId === currentAuction._id) {
        setWatchers(watchers);
      }
    };

    const handleAuctionMessage = ({ auctionId, message, actionType, sender, timestamp }) => {
      if (auctionId === currentAuction._id) {
        const senderName = typeof sender === "object" ? (sender.name || "Admin") : "Admin";
        setBidHistory((prev) => [
          ...prev,
          {
            message: message || actionType,
            bidTime: timestamp || new Date(),
            sender: senderName,
          },
        ]);
      }
    };

    socket.on("watcherUpdate", handleWatcherUpdate);
    socket.on("auctionMessage", handleAuctionMessage);

    joinAuction(currentAuction._id);
    getAuctionData(currentAuction._id);

    return () => {
      socket.off("watcherUpdate", handleWatcherUpdate);
      socket.off("auctionMessage", handleAuctionMessage);
    };
  }, [socket, currentAuction, joinAuction, getAuctionData]);

  const handleCatalogSelect = (catalog) => {
    setSelectedCatalog(catalog);
    const liveAuctions = catalog.auctions.filter(
      (a) => a.status === "ACTIVE" && a.auctionType === "LIVE"
    );
    if (liveAuctions.length > 0) {
      setCurrentAuction(liveAuctions[0]); // Set the first live auction
      setBidHistory(liveAuctions[0].bids || []);
      setWatchers(0);
    } else {
      setCurrentAuction(null);
      setBidHistory([]);
      setWatchers(0);
      toast.info("No live auctions available in this catalog.");
    }
  };

  const handleAdminAction = async (actionType) => {
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }
    try {
      performAdminAction(currentAuction._id, actionType);
      if (actionType === "NEXT_LOT") {
        const liveAuctions = selectedCatalog.auctions.filter(
          (a) => a.status === "ACTIVE" && a.auctionType === "LIVE"
        );
        const currentIndex = liveAuctions.findIndex((a) => a._id === currentAuction._id);
        if (currentIndex < liveAuctions.length - 1) {
          setCurrentAuction(liveAuctions[currentIndex + 1]);
          setBidHistory(liveAuctions[currentIndex + 1].bids || []);
          setWatchers(0);
        } else {
          setCurrentAuction(null);
          setBidHistory([]);
          setWatchers(0);
          toast.success("No more lots in this catalog.");
        }
      } else if (actionType === "SOLD" || actionType === "PASS") {
        fetchAuctionData(); // Refresh to update status
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
    sendMessage(currentAuction._id, message);
    setMessage("");
    toast.success("Message sent successfully!");
  };

  const handleBackToCatalogs = () => {
    setSelectedCatalog(null);
    setCurrentAuction(null);
    setBidHistory([]);
    setWatchers(0);
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
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                {selectedCatalog
                  ? `${selectedCatalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE").length} of ${selectedCatalog.auctions.length} Lots`
                  : "0 of 0 Lots"}
              </div>
              <div className="text-sm">
                {selectedCatalog && selectedCatalog.auctions.length > 0
                  ? Math.round(
                      ((selectedCatalog.auctions.length -
                        selectedCatalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE").length) /
                        selectedCatalog.auctions.length) *
                        100
                    )
                  : 0}%
              </div>
              <div className="text-sm">Online: {watchers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {!selectedCatalog ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogs.map((catalog) => (
              <CatalogCard key={catalog.catalogName} catalog={catalog} onClick={() => handleCatalogSelect(catalog)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Auction Details */}
            <div>
              <AuctionDetails
                currentAuction={currentAuction}
                upcomingLots={selectedCatalog.auctions.filter(
                  (a) => a.status === "ACTIVE" && a.auctionType === "LIVE" && a._id !== currentAuction?._id
                )}
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
                setAuctionMode={(mode) => updateAuctionMode(currentAuction?._id, mode)}
                auctionMode={currentAuction ? auctionModes[currentAuction._id] || "online" : "online"}
                onBack={handleBackToCatalogs} // Pass back handler
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;