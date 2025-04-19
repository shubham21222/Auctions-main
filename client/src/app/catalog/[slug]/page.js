"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogCarousel from "./CatalogCarousel";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const Notification = ({ type, message }) => {
  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-blue-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${bgColor} text-white p-3 rounded-lg mb-3 shadow-lg border border-opacity-20 border-white max-w-md`}
    >
      <div className="font-medium">{message}</div>
      <div className="text-xs opacity-80 mt-1">{new Date().toLocaleTimeString()}</div>
    </motion.div>
  );
};

export default function CatalogPage() {
  const { slug } = useParams();
  const auctionId = slug;
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [allAuctions, setAllAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [headerData, setHeaderData] = useState({
    productName: "Loading...",
    lotNumber: "N/A",
    catalog: "Uncategorized",
    endDate: null,
    status: "Loading",
  });
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth._id);
  const isClerk = useSelector((state) => state.auth.isClerk);
  const router = useRouter();
  const {
    socket,
    liveAuctions,
    setLiveAuctions,
    joinAuction,
    placeBid,
    getAuctionData,
    notifications,
    subscribeToEvents,
    getBidIncrement,
    sendMessage,
    performClerkAction,
    updateAuctionMode,
    auctionModes,
  } = useSocket();
  const hasJoinedRef = useRef(new Set());

  const fetchAuctionData = useCallback(
    async () => {
      if (!token || !auctionId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulkgetbyId/${auctionId}`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch auction data");
        const auctionData = await response.json();
        if (!auctionData.status || !auctionData.items) throw new Error("Invalid auction data");

        const auctionResult = {
          ...auctionData.items,
          messages: Array.isArray(auctionData.items.messages) ? auctionData.items.messages : [],
          catalog: auctionData.items.catalog || auctionData.items.category?.name || "Uncategorized",
          bids: Array.isArray(auctionData.items.bids) ? auctionData.items.bids : [],
        };

        console.log("Catalog: Fetched Auction Data for ID:", auctionId, auctionResult);

        setAuction(auctionResult);
        setHeaderData({
          productName: auctionResult.product?.title || "Unnamed Item",
          lotNumber: auctionResult.lotNumber || "N/A",
          catalog: auctionResult.catalog,
          endDate: auctionResult.endDate,
          status: auctionResult.status || "Loading",
        });

        setIsJoined(
          Array.isArray(auctionResult.participants) &&
            auctionResult.participants.some((p) => p._id === userId)
        );

        setProduct({
          id: auctionResult.product?._id || "",
          name: auctionResult.product?.title || "Unnamed Item",
          images: Array.isArray(auctionResult.product?.image) ? auctionResult.product.image : [],
          description: auctionResult.description || "No additional description available.",
          price: {
            min: auctionResult.product?.price || 0,
            max: auctionResult.product?.price ? auctionResult.product.price + 1000 : 1000,
          },
        });

        setLiveAuctions((prev) => {
          const exists = prev.find((a) => a.id === auctionId);
          return exists
            ? prev.map((a) => (a.id === auctionId ? { ...a, ...auctionResult, id: auctionId } : a))
            : [...prev, { ...auctionResult, id: auctionId }];
        });

        const allAuctionsResponse = await fetch(`${config.baseURL}/v1/api/auction/bulk`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!allAuctionsResponse.ok) throw new Error("Failed to fetch all auctions");
        const allAuctionsData = await allAuctionsResponse.json();
        if (allAuctionsData.status && allAuctionsData.items?.catalogs) {
          const auctions = allAuctionsData.items.catalogs.flatMap((catalog) =>
            catalog.auctions.map((auction) => ({
              ...auction,
              catalog: catalog.catalogName,
            }))
          );
          console.log("Catalog: All Auctions Fetched:", auctions);
          setAllAuctions(auctions);
        }
      } catch (error) {
        console.error("Catalog: Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [auctionId, token, setLiveAuctions, userId]
  );

  useEffect(() => {
    fetchAuctionData();
  }, [fetchAuctionData]);

  useEffect(() => {
    if (!auctionId || !socket) return;

    if (!hasJoinedRef.current.has(auctionId)) {
      joinAuction(auctionId);
      hasJoinedRef.current.add(auctionId);
      console.log(`Catalog: Joined auction ${auctionId} as ${isClerk ? "Clerk" : "User"}`);
    }

    const unsubscribe = subscribeToEvents(auctionId, {
      onBidUpdate: ({ auctionId: msgAuctionId, bidAmount, bidderId, bidType, timestamp, minBidIncrement, bids }) => {
        console.log("Catalog: Received bidUpdate:", { msgAuctionId, bidAmount, bidType });
        if (msgAuctionId === auctionId) {
          setAuction((prev) => {
            const newBid = {
              bidder: bidderId,
              bidAmount,
              bidTime: timestamp || new Date(),
              bidType,
            };
            const updatedBids = [...(prev?.bids || []), newBid];
            return {
              ...prev,
              currentBid: bidAmount,
              currentBidder: bidderId,
              minBidIncrement,
              bids: updatedBids,
            };
          });
          toast.success(`New ${bidType} bid: $${bidAmount.toLocaleString()}`);
        }
      },
      onAuctionMessage: ({ auctionId: msgAuctionId, message, actionType, sender, timestamp, bidType, nextActiveAuction, nextAuctionProductName, nextAuctionCatalogName }) => {
        console.log("Catalog: Received auctionMessage:", { msgAuctionId, actionType, message, nextActiveAuction, nextAuctionProductName, nextAuctionCatalogName });
        if (msgAuctionId === auctionId) {
          const newMessage = {
            message: message || actionType || "Update",
            actionType,
            sender:
              typeof sender === "object"
                ? sender.name || "Admin"
                : "Admin",
            timestamp: timestamp || new Date(),
            bidType: bidType || (message ? "message" : actionType),
            nextActiveAuction,
            nextAuctionProductName,
            nextAuctionCatalogName,
          };

          setAuction((prev) => ({
            ...prev,
            messages: [...(prev?.messages || []), newMessage],
          }));

          // Update nextActiveAuction in allAuctions
          if (nextActiveAuction) {
            setAllAuctions((prev) =>
              prev.map((auction) =>
                auction._id === nextActiveAuction._id
                  ? { ...auction, ...nextActiveAuction, nextAuctionProductName, nextAuctionCatalogName }
                  : auction
              )
            );
          }

          if (actionType === "SOLD") {
            toast.success(message, { duration: 5000 });
            if (nextActiveAuction?._id) {
              setTimeout(() => {
                router.push(`/catalog/${nextActiveAuction._id}`);
              }, 3000);
            }
          } else if (message) {
            toast.info(message);
          }
        }
      },
      onWatcherUpdate: ({ auctionId: msgAuctionId, watchers }) => {
        console.log("Catalog: Received watcherUpdate:", { msgAuctionId, watchers });
        if (msgAuctionId === auctionId) {
          setAuction((prev) => ({ ...prev, watchers }));
        }
      },
      onLatestBidRemoved: ({ auctionId: msgAuctionId, updatedBids, currentBid, currentBidder }) => {
        console.log("Catalog: Received latestBidRemoved:", { msgAuctionId, currentBid });
        if (msgAuctionId === auctionId) {
          setAuction((prev) => ({
            ...prev,
            currentBid,
            currentBidder,
            bids: updatedBids,
          }));
          toast.warning("Latest bid has been removed.");
        }
      },
      onAuctionModeUpdate: ({ auctionId: msgAuctionId, mode }) => {
        console.log("Catalog: Received auctionModeUpdate:", { msgAuctionId, mode });
        if (msgAuctionId === auctionId) {
          auctionModes[msgAuctionId] = mode;
        }
      },
    });

    return () => {
      console.log(`Catalog: Unsubscribing from auction ${auctionId}`);
      unsubscribe();
    };
  }, [auctionId, socket, joinAuction, subscribeToEvents, isClerk, router, fetchAuctionData]);

  useEffect(() => {
    const liveAuction = liveAuctions.find((a) => a.id === auctionId);
    if (liveAuction && JSON.stringify(liveAuction) !== JSON.stringify(auction)) {
      console.log("Catalog: Syncing auction with liveAuctions:", liveAuction);
      setAuction((prev) => ({
        ...prev,
        currentBid: liveAuction.currentBid,
        bids: liveAuction.bids || prev?.bids || [],
        messages: liveAuction.messages || prev?.messages || [],
        status: liveAuction.status || prev?.status,
        watchers: liveAuction.watchers || prev?.watchers || 0,
      }));
    }
  }, [liveAuctions, auctionId]);

  const handlePlaceBid = async (bidType, bidAmount) => {
    if (!auction || !auction._id) {
      toast.error("Cannot place bid. Auction not available.");
      return;
    }
    if (!userId) {
      toast.error("Please log in to place a bid");
      return;
    }

    try {
      const auctionData = await getAuctionData(auction._id);
      const currentBid = auctionData.currentBid || 0;
      const bidIncrement = getBidIncrement(currentBid);
      let finalBidAmount = bidAmount || currentBid + bidIncrement;

      if (bidType === "competitor" && !isClerk) {
        toast.error("Only clerks can place competitive bids.");
        return;
      }

      if (bidType === "online" && isClerk) {
        toast.error("Clerks cannot place online bids.");
        return;
      }

      const success = await placeBid(auction._id, bidType, finalBidAmount);
      if (!success) {
        throw new Error("Failed to place bid via socket");
      }

      console.log(
        `Catalog: ${bidType} bid placed via socket for auction ${auction._id}: $${finalBidAmount}`
      );

      const response = await fetch(`${config.baseURL}/v1/api/auction/placeBid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          auctionId: auction._id,
          bidAmount: finalBidAmount,
          bidType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn("API bid placement returned error, but socket bid was accepted:", errorData);
      }
    } catch (error) {
      console.error("Catalog: Place Bid Error:", error);
      toast.error(error.message || "Failed to place bid");
    }
  };

  const handleSendMessage = (message) => {
    if (isClerk) {
      sendMessage(auctionId, message);
    } else {
      toast.error("Only clerks can send messages.");
    }
  };

  const handleClerkAction = (actionType) => {
    if (isClerk) {
      performClerkAction(auctionId, actionType);
    } else {
      toast.error("Only clerks can perform this action.");
    }
  };

  return (
    <div className="max-w-[1400px] flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {loading ? (
        <div className="lg:fixed left-0 top-[70px] h-[200px] lg:h-[calc(100vh-70px)] w-full lg:w-[350px] bg-white border-b lg:border-r border-slate-200 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading auctions...</p>
          </div>
        </div>
      ) : auction && allAuctions.length > 0 ? (
        <div className="lg:fixed left-0 top-[70px] h-[200px] lg:h-[calc(100vh-70px)] w-full lg:w-[350px]">
          <CatalogCarousel
            catalogName={auction.catalog}
            auctions={allAuctions.filter((a) => {
              const normalizedAuctionCatalog = (a.catalog || "").trim().toLowerCase();
              const normalizedCurrentCatalog = (auction.catalog || "").trim().toLowerCase();
              return normalizedAuctionCatalog === normalizedCurrentCatalog;
            })}
            currentTime={new Date()}
            currentAuctionId={auctionId}
            onSelectAuction={(auctionId) => router.push(`/catalog/${auctionId}`)}
          />
        </div>
      ) : (
        <div className="lg:fixed left-0 top-[70px] h-[200px] lg:h-[calc(100vh-70px)] w-full lg:w-[350px] bg-white border-b lg:border-r border-slate-200 flex items-center justify-center">
          <p className="text-slate-600 font-medium">No auctions available</p>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 min-h-screen relative lg:ml-[350px] bg-gradient-to-br from-slate-50 to-white"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6 lg:space-y-8"
          >
            <CatalogHeader
              productName={headerData.productName}
              auctionEndDate={headerData.endDate}
              lotNumber={headerData.lotNumber}
              catalog={headerData.catalog}
              status={headerData.status}
            />
            <div className="mt-6 lg:mt-8">
              <CatalogDetails
                product={product}
                auction={auction}
                loading={loading}
                onBidNowClick={handlePlaceBid}
                onSendMessage={handleSendMessage}
                onClerkAction={handleClerkAction}
                token={token}
                notifications={notifications}
                socket={socket}
                messages={auction?.messages || []}
                isJoined={isJoined}
                setIsJoined={setIsJoined}
                userId={userId}
                isClerk={isClerk}
                auctionMode={auctionModes[auctionId] || "competitor"}
                updateAuctionMode={(mode) => updateAuctionMode(auctionId, mode)}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}