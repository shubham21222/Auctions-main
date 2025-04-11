"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket"; // Use useSocket instead of useMemberSocket
import config from "@/app/config_BASE_URL";
import toast from "react-hot-toast";
import CatalogCard from "./CatalogCard.js";
import AuctionDetails from "./AuctionDetails";
import AuctionControls from "./AuctionControls";

const MemberLiveAuctionPage = () => {
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth._id);
  const role = useSelector((state) => state.auth.user.role);

  const { 
    socket, 
    joinAuction, 
    getAuctionData, 
    sendMessage, 
    performAdminAction, // Use performAdminAction since clerks have same privileges
    updateAuctionMode, 
    auctionModes, 
    placeBid, 
    getBidIncrement, 
    liveAuctions, 
    setLiveAuctions,
    subscribeToEvents 
  } = useSocket();

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
    console.log("MemberLiveAuctionPage: Redux state =", { token, userId, role });
    if (role !== "clerk") {
      toast.error("Access denied. Only clerks can access this page.");
      return;
    }
    fetchAuctionData();
  }, [fetchAuctionData, role]);

  useEffect(() => {
    if (currentAuction?._id && !joinedRooms.has(currentAuction._id) && role === "clerk") {
      console.log("Joining auction room:", currentAuction._id);
      joinAuction(currentAuction._id);
      setJoinedRooms((prev) => new Set([...prev, currentAuction._id]));

      const unsubscribe = subscribeToEvents(currentAuction._id, {
        onBidUpdate: ({ auctionId, bidAmount, bidderId, bidType, timestamp, minBidIncrement, bids }) => {
          if (auctionId === currentAuction._id) {
            console.log("MemberLiveAuctionPage: Received bidUpdate:", { auctionId, bidAmount, bidType });
            setCurrentAuction((prev) => ({
              ...prev,
              currentBid: bidAmount,
              currentBidder: bidderId,
              minBidIncrement: minBidIncrement || prev.minBidIncrement,
              bids: bids || [
                ...(prev.bids || []),
                { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType },
              ],
            }));
            setBidHistory((prev) => bids || [
              ...prev,
              { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType },
            ]);
            setLiveAuctions((prev) =>
              prev.map((a) =>
                a.id === auctionId
                  ? {
                      ...a,
                      currentBid: bidAmount,
                      currentBidder: bidderId,
                      minBidIncrement: minBidIncrement || a.minBidIncrement,
                      bids: bids || [
                        ...(a.bids || []),
                        { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType },
                      ],
                    }
                  : a
              )
            );
            toast.success(`New ${bidType} bid: $${bidAmount.toLocaleString()}`);
          }
        },
        onAuctionMessage: ({ auctionId, message, actionType, sender, timestamp }) => {
          if (auctionId === currentAuction._id) {
            setCurrentAuction((prev) => ({
              ...prev,
              messages: [...(prev.messages || []), { message: message || actionType, sender, timestamp }],
            }));
            setBidHistory((prev) => [
              ...prev,
              { message: message || actionType, bidTime: timestamp || new Date(), sender, bidType: "message" },
            ]);
            setLiveAuctions((prev) =>
              prev.map((a) =>
                a.id === auctionId
                  ? { ...a, messages: [...(a.messages || []), { message: message || actionType, sender, timestamp }] }
                  : a
              )
            );
          }
        },
        onWatcherUpdate: ({ auctionId, watchers }) => {
          if (auctionId === currentAuction._id) {
            setWatchers(watchers);
          }
        },
        onLatestBidRemoved: ({ auctionId, updatedBids, currentBid, currentBidder }) => {
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

      return () => unsubscribe();
    }
  }, [currentAuction?._id, joinAuction, joinedRooms, subscribeToEvents, setLiveAuctions, role]);

  useEffect(() => {
    if (currentAuction && role === "clerk") {
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
  }, [liveAuctions, currentAuction?._id, role]);

  useEffect(() => {
    if (selectedCatalog && !currentAuction && role === "clerk") {
      const firstLiveAuction = selectedCatalog.auctions.find(
        (a) => a.status === "ACTIVE" && a.auctionType === "LIVE"
      );
      if (firstLiveAuction) {
        setCurrentAuction(firstLiveAuction);
        setBidHistory(firstLiveAuction.bids || []);
      }
    }
  }, [selectedCatalog, role]);

  const handleCatalogSelect = (catalog) => {
    if (role !== "clerk") {
      toast.error("Only clerks can select catalogs.");
      return;
    }
    setSelectedCatalog(catalog);
    setCurrentAuction(null);
    setBidHistory([]);
    setWatchers(0);
    setJoinedRooms(new Set());
  };

  const handleAdminAction = async (actionType) => {
    if (role !== "clerk") {
      toast.error("Only clerks can perform actions.");
      return;
    }
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
        toast.success(`Action ${actionType} performed successfully`);
      }

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

        toast.success("Auction marked as sold and status updated to ENDED");
        fetchAuctionData();
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast.error(`Error performing ${actionType}: ${error.message}`);
    }
  };

  const handleSendMessage = () => {
    if (role !== "clerk") {
      toast.error("Only clerks can send messages.");
      return;
    }
    if (!message || !currentAuction) {
      toast.error("Please enter a message and ensure an auction is selected.");
      return;
    }
    sendMessage(currentAuction._id, message);
    setMessage("");
    toast.success("Message sent successfully!");
  };

  const handleBackToCatalogs = () => {
    if (role !== "clerk") {
      toast.error("Only clerks can navigate back.");
      return;
    }
    setSelectedCatalog(null);
    setCurrentAuction(null);
    setBidHistory([]);
    setWatchers(0);
    setJoinedRooms(new Set());
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (role !== "clerk") {
    return <div className="text-center py-12">Access denied. Only clerks can access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white">
        <div className="px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Live Auctions</h1>
              {selectedCatalog && (
                <div className="ml-8 text-sm">
                  <span className="ml-2 text-blue-400">
                    {Math.round(
                      ((selectedCatalog.auctions.length -
                        selectedCatalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE").length) /
                        selectedCatalog.auctions.length) *
                        100
                    )}% Complete
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm">
                {currentAuction ? `Lot ${currentAuction.lotNumber || ''} of ${selectedCatalog?.auctions.length || 0}` : ''}
              </div>
              <div className="text-sm">Online: {watchers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {!selectedCatalog ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {catalogs.map((catalog) => (
              <CatalogCard 
                key={catalog._id || catalog.catalogName} 
                catalog={catalog} 
                onSelect={handleCatalogSelect}
                isSelected={selectedCatalog?._id === catalog._id}
              />
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
                onSelectLot={(lot) => {
                  if (role !== "clerk") {
                    toast.error("Only clerks can select lots.");
                    return;
                  }
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
              />
            </div>
            <AuctionControls
              currentAuction={currentAuction}
              setCurrentAuction={setCurrentAuction}
              bidHistory={bidHistory}
              handleAdminAction={handleAdminAction} // Use handleAdminAction
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
        )}
      </div>
    </div>
  );
};

export default MemberLiveAuctionPage;