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
  const { socket, joinAuction, getAuctionData, sendMessage, performAdminAction, updateAuctionMode, auctionModes, placeBid, getBidIncrement, liveAuctions } = useSocket();
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [watchers, setWatchers] = useState(0);
  const [joinedRooms, setJoinedRooms] = useState(new Set());

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
    fetchAuctionData();
  }, [fetchAuctionData]);

  useEffect(() => {
    if (currentAuction) {
      const liveAuction = liveAuctions.find((a) => a.id === currentAuction._id);
      if (liveAuction) {
        setCurrentAuction((prev) => ({
          ...prev,
          currentBid: liveAuction.currentBid,
          bids: liveAuction.bids || prev.bids,
          messages: liveAuction.messages || prev.messages || [],
        }));
        setBidHistory(liveAuction.bids || []);
      }
    }
  }, [liveAuctions, currentAuction?._id]);

  useEffect(() => {
    let cleanup = () => {};

    if (!socket || !currentAuction) return;

    if (!joinedRooms.has(currentAuction._id)) {
      joinAuction(currentAuction._id);
      getAuctionData(currentAuction._id);
      setJoinedRooms((prev) => new Set(prev).add(currentAuction._id));
    }

    const handleWatcherUpdate = ({ auctionId, watchers }) => {
      if (auctionId === currentAuction._id) {
        setWatchers(watchers);
      }
    };

    const handleAuctionMessage = ({ auctionId, message, actionType, sender, timestamp, bidAmount, bidType }) => {
      if (auctionId === currentAuction._id) {
        const senderName = typeof sender === "object" ? sender.name || "Admin" : "Admin";
        setBidHistory((prev) => [
          ...prev,
          {
            message: message || actionType,
            bidTime: timestamp || new Date(),
            sender: senderName,
            bidType: bidType || (message ? "message" : actionType),
            bidAmount: bidAmount || (bidType === "competitor" && prev.length > 0 ? prev[prev.length - 1].bidAmount + getBidIncrement(prev[prev.length - 1].bidAmount || 0) : currentAuction.startingBid),
          },
        ]);
      }
    };

    const handleBidUpdate = ({ auctionId, bidAmount, bidderId, bidType, timestamp }) => {
      if (auctionId === currentAuction._id) {
        setBidHistory((prev) => [
          ...prev,
          {
            bidAmount,
            bidType,
            bidder: bidderId,
            bidTime: timestamp || new Date(),
            sender: "Admin",
          },
        ]);
        setCurrentAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          bids: [...(prev.bids || []), { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType }],
        }));
      }
    };

    socket.on("watcherUpdate", handleWatcherUpdate);
    socket.on("auctionMessage", handleAuctionMessage);
    socket.on("bidUpdate", handleBidUpdate);

    cleanup = () => {
      socket.off("watcherUpdate", handleWatcherUpdate);
      socket.off("auctionMessage", handleAuctionMessage);
      socket.off("bidUpdate", handleBidUpdate);
    };

    return cleanup;
  }, [socket, currentAuction?._id, joinAuction, getAuctionData, getBidIncrement]);

  const handleCatalogSelect = (catalog) => {
    setSelectedCatalog(catalog);
    const liveAuctions = catalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE");
    if (liveAuctions.length > 0) {
      setCurrentAuction(liveAuctions[0]);
      setBidHistory(liveAuctions[0].bids || []);
      setWatchers(0);
      setJoinedRooms(new Set());
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
      sendMessage(currentAuction._id, actionType);
      if (actionType === "NEXT_LOT") {
        const liveAuctions = selectedCatalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE");
        const currentIndex = liveAuctions.findIndex((a) => a._id === currentAuction._id);
        if (currentIndex < liveAuctions.length - 1) {
          setCurrentAuction(liveAuctions[currentIndex + 1]);
          setBidHistory(liveAuctions[currentIndex + 1].bids || []);
          setWatchers(0);
          setJoinedRooms((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentAuction._id);
            return newSet;
          });
        } else {
          setCurrentAuction(null);
          setBidHistory([]);
          setWatchers(0);
          toast.success("No more lots in this catalog.");
        }
      } else if (actionType === "SOLD") {
        // Use the auction ID in the payload
        const auctionId = currentAuction._id;

        if (!auctionId) {
          throw new Error("Auction ID not found in current auction");
        }

        // Call API to update auction status to "ENDED" with auction ID in payload
        const response = await fetch(`${config.baseURL}/v1/api/auction/update/${auctionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            auctionId: auctionId, // Pass auction ID in payload
            status: "ENDED", // Set status to "ENDED"
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update auction status");
        }

        toast.success("Auction marked as sold and status updated to ENDED");
        fetchAuctionData(); // Refresh data after updating
      } else if (actionType === "PASS") {
        fetchAuctionData(); // Refresh data after passing
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
    setJoinedRooms(new Set());
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
            <div>
              <AuctionDetails
                currentAuction={currentAuction}
                upcomingLots={selectedCatalog.auctions.filter(
                  (a) => a.status === "ACTIVE" && a.auctionType === "LIVE" && a._id !== currentAuction?._id
                )}
              />
            </div>
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
                onBack={handleBackToCatalogs}
                placeBid={placeBid}
                getBidIncrement={getBidIncrement}
                token={token} // Pass token to AuctionControls
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;