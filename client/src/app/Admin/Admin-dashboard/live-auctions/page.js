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
  const userId = useSelector((state) => state.auth._id);
  const { socket, joinAuction, getAuctionData, sendMessage, performAdminAction, updateAuctionMode, auctionModes, placeBid, getBidIncrement, liveAuctions, subscribeToEvents } = useSocket();
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
      if (liveAuction && JSON.stringify(liveAuction) !== JSON.stringify(currentAuction)) {
        console.log("Syncing currentAuction with liveAuctions:", liveAuction);
        setCurrentAuction((prev) => ({
          ...prev,
          currentBid: liveAuction.currentBid,
          bids: liveAuction.bids || prev.bids,
          messages: liveAuction.messages || prev.messages || [],
          watchers: liveAuction.watchers || prev.watchers || 0,
        }));
        setBidHistory(liveAuction.bids || []);
        setWatchers(liveAuction.watchers || 0);
      }
    }
  }, [liveAuctions, currentAuction?._id]);

  useEffect(() => {
    let cleanup = () => {};

    if (!socket || !currentAuction) return;

    if (!joinedRooms.has(currentAuction._id)) {
      joinAuction(currentAuction._id);
      getAuctionData(currentAuction._id)
        .then((data) => console.log("Admin: Fetched initial auction data:", data))
        .catch((err) => console.error("Admin: Error fetching initial auction data:", err));
      setJoinedRooms((prev) => new Set(prev).add(currentAuction._id));
    }

    const unsubscribe = subscribeToEvents(currentAuction._id, {
      onBidUpdate: ({ auctionId, bidAmount, bidderId, bidType, timestamp, minBidIncrement, bids }) => {
        console.log("Admin: Received bidUpdate:", { auctionId, bidAmount, bidType });
        if (auctionId === currentAuction._id) {
          setBidHistory(bids || []);
          setCurrentAuction((prev) => ({
            ...prev,
            currentBid: bidAmount,
            currentBidder: bidderId,
            minBidIncrement,
            bids: bids || prev.bids,
          }));
        }
      },
      onAuctionMessage: ({ auctionId, message, actionType, sender, timestamp, bidType }) => {
        console.log("Admin: Received auctionMessage:", { auctionId, message, actionType });
        if (auctionId === currentAuction._id) {
          setBidHistory((prev) => [
            ...prev,
            {
              message: message || actionType,
              bidTime: timestamp || new Date(),
              sender: typeof sender === "object" ? sender.name || "Admin" : "Admin",
              bidType: bidType || (message ? "message" : actionType),
              bidAmount: 0,
            },
          ]);
        }
      },
      onWatcherUpdate: ({ auctionId, watchers }) => {
        console.log("Admin: Received watcherUpdate:", { auctionId, watchers });
        if (auctionId === currentAuction._id) {
          setWatchers(watchers);
        }
      },
      onLatestBidRemoved: ({ auctionId, updatedBids, currentBid, currentBidder }) => {
        console.log("Admin: Received latestBidRemoved:", { auctionId, currentBid });
        if (auctionId === currentAuction._id) {
          setBidHistory(updatedBids || []);
          setCurrentAuction((prev) => ({
            ...prev,
            currentBid,
            currentBidder,
            bids: updatedBids,
          }));
        }
      },
    });

    cleanup = () => unsubscribe();

    return cleanup;
  }, [socket, currentAuction?._id, joinAuction, getAuctionData, watchers, subscribeToEvents]);

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
      toast.error("No live auctions available in this catalog.");
    }
  };

  const handleAdminAction = async (actionType) => {
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }
    try {
      if (actionType === "RETRACT") {
        if (!socket) {
          toast.error("Socket connection not available.");
          return;
        }
        socket.emit("remove_latest_bid", { auctionId: currentAuction._id });
        toast("Latest bid retracted. Note: Retraction is subject to auction rules.", { type: "warning" });
      } else if (actionType === "RESERVE_NOT_MET") {
        performAdminAction(currentAuction._id, actionType);
        toast("Reserve not met: Minimum price not reached, item may not sell.", { type: "info" });
      } else {
        performAdminAction(currentAuction._id, actionType);
      }

      if (actionType === "NEXT_LOT") {
        const liveAuctions = selectedCatalog.auctions.filter(
          (a) => a.status === "ACTIVE" && a.auctionType === "LIVE"
        );
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
        const auctionId = currentAuction._id;
        if (!auctionId) throw new Error("Auction ID not found in current auction");

        const response = await fetch(`${config.baseURL}/v1/api/auction/update/${auctionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            auctionId,
            status: "ENDED",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update auction status");
        }

        const responseData = await response.json();
        const nextActiveAuction = responseData.items?.nextActiveAuction;

        // Fetch full details of the next active auction
        let nextAuctionProductName = null;
        let nextAuctionCatalogName = null;
        if (nextActiveAuction?._id) {
          try {
            const nextAuctionResponse = await fetch(
              `${config.baseURL}/v1/api/auction/bulkgetbyId/${nextActiveAuction._id}`,
              {
                method: "GET",
                headers: { Authorization: `${token}` },
              }
            );
            if (nextAuctionResponse.ok) {
              const nextAuctionData = await nextAuctionResponse.json();
              if (nextAuctionData.status && nextAuctionData.items) {
                nextAuctionProductName = nextAuctionData.items.product?.title || "Unnamed Item";
                nextAuctionCatalogName = nextAuctionData.items.catalog || "Uncategorized";
              }
            }
          } catch (error) {
            console.error("Error fetching next auction details:", error);
          }
        }

        toast.success("Auction marked as sold and status updated to ENDED");
        setCurrentAuction((prev) => ({ ...prev, status: "ENDED" }));
        await fetchAuctionData();

        // Emit SOLD action with nextActiveAuction and additional details
        if (socket) {
          socket.emit("auctionMessage", {
            auctionId,
            actionType: "SOLD",
            message: nextActiveAuction
              ? `Auction has ended and sold. Next auction: ${nextAuctionProductName} in ${nextAuctionCatalogName}. Please join the next product auction.`
              : "Auction has ended and sold.",
            nextActiveAuction: nextActiveAuction || null,
            nextAuctionProductName,
            nextAuctionCatalogName,
          });
        }
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
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white">
        <div className="px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">NY Elizabeth</h1>
              <div className="ml-8 text-sm">
                <span className="ml-2 text-blue-400">
                  {selectedCatalog && selectedCatalog.auctions.length > 0
                    ? Math.round(
                        ((selectedCatalog.auctions.length -
                          selectedCatalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE").length) /
                          selectedCatalog.auctions.length) *
                          100
                      )
                    : 0}% Complete
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                {currentAuction ? `${currentAuction.lotNumber || ''} of ${selectedCatalog?.auctions.length || 0} Lots Remaining` : ''}
              </div>
              <div className="text-sm">Online: {watchers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
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
                  (a) => a.auctionType === "LIVE" && a._id !== currentAuction?._id
                )}
                onSelectLot={(lot) => {
                  setCurrentAuction(lot);
                  setBidHistory(lot.bids || []);
                  setWatchers(0);
                  setJoinedRooms((prev) => {
                    const newSet = new Set(prev);
                    if (currentAuction?._id) {
                      newSet.delete(currentAuction._id);
                    }
                    return newSet;
                  });
                }}
                token={token}
              />
            </div>
            <div>
              <AuctionControls
                currentAuction={currentAuction}
                setCurrentAuction={setCurrentAuction}
                bidHistory={bidHistory}
                handleAdminAction={handleAdminAction}
                handleSendMessage={handleSendMessage}
                message={message}
                setMessage={setMessage}
                watchers={watchers}
                socket={socket}
                setAuctionMode={(mode) => updateAuctionMode(currentAuction?._id, mode)}
                auctionMode={currentAuction ? auctionModes[currentAuction._id] || "competitor" : "competitor"}
                onBack={handleBackToCatalogs}
                placeBid={placeBid}
                getBidIncrement={getBidIncrement}
                getAuctionData={getAuctionData}
                token={token}
                userId={userId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveAuctionPage;