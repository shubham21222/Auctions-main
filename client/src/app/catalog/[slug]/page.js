"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogCarousel from "./CatalogCarousel";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
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
  const router = useRouter();
  const { socket, liveAuctions, setLiveAuctions, joinAuction, placeBid, getAuctionData, notifications } = useSocket();
  const hasJoinedRef = useRef(new Set()); // Track joined auctions

  const fetchAuctionData = useCallback(async () => {
    if (!token || !auctionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const auctionResponse = await fetch(`${config.baseURL}/v1/api/auction/bulkgetbyId/${auctionId}`, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      if (!auctionResponse.ok) throw new Error("Failed to fetch auction");
      const auctionData = await auctionResponse.json();
      if (auctionData.status && auctionData.items) {
        const auctionResult = {
          ...auctionData.items,
          messages: Array.isArray(auctionData.items.messages) ? auctionData.items.messages : [],
          catalog: auctionData.items.category?.name || auctionData.items.catalog || "Uncategorized",
        };

        console.log("Fetched Auction:", auctionResult);

        setAuction(auctionResult);
        setHeaderData({
          productName: auctionResult.product?.title || "Unnamed Item",
          lotNumber: auctionResult.lotNumber || "N/A",
          catalog: auctionResult.catalog,
          endDate: auctionResult.endDate,
          status: auctionResult.status || "Loading",
        });

        setIsJoined(
          Array.isArray(auctionResult.participants) && auctionResult.participants.some((p) => p._id === userId)
        );

        setProduct({
          id: auctionResult.product?._id || "",
          name: auctionResult.product?.title || "Unnamed Item",
          images: Array.isArray(auctionResult.product?.image) ? auctionResult.product.image : [],
          description: auctionResult.product?.description || "No additional description available.",
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
          console.log("All Auctions Fetched:", auctions);
          setAllAuctions(auctions);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [auctionId, token, setLiveAuctions, userId]);

  useEffect(() => {
    fetchAuctionData();
  }, [fetchAuctionData]);

  useEffect(() => {
    if (!auctionId || !socket) return;

    // Join auction only once
    if (!hasJoinedRef.current.has(auctionId)) {
      joinAuction(auctionId);
      hasJoinedRef.current.add(auctionId);
      console.log(`Joined auction ${auctionId} once`);

      getAuctionData(auctionId)
        .then((data) => {
          console.log("Received initial auction data:", data);
          setAuction((prev) => ({ ...prev, ...data }));
        })
        .catch((err) => {
          console.error("Error fetching initial auction data:", err);
          toast.error("Failed to load auction data. Please try refreshing.");
        });
    }

    // Set up socket listeners (these should persist even after joining)
    const handleAuctionMessage = ({ auctionId: msgAuctionId, message, actionType, sender, timestamp, bidType }) => {
      console.log("Received auctionMessage in CatalogPage:", { msgAuctionId, message, actionType, sender, timestamp, bidType });
      if (msgAuctionId === auctionId) {
        const newMessage = {
          message: message || actionType || "Update",
          actionType,
          sender: typeof sender === "object" ? sender.name || "Admin" : sender || "Admin",
          timestamp: timestamp || new Date(),
          bidType: bidType || "message",
        };
        setAuction((prev) => {
          const updatedMessages = [...(prev?.messages || []), newMessage];
          console.log("Updated auction messages:", updatedMessages);
          return {
            ...prev,
            messages: updatedMessages,
          };
        });
        toast.info(`Auction update: ${newMessage.message}`);
      }
    };

    const handleBidUpdate = (bidData) => {
      console.log("Received bidUpdate in CatalogPage:", bidData);
      if (bidData.auctionId === auctionId) {
        setAuction((prev) => ({
          ...prev,
          currentBid: bidData.bidAmount,
          bids: [
            ...(prev?.bids || []),
            {
              bidder: bidData.bidderId,
              bidAmount: bidData.bidAmount,
              bidTime: bidData.timestamp || new Date(),
              bidType: bidData.bidType,
            },
          ],
        }));
      }
    };

    socket.on("auctionMessage", handleAuctionMessage);
    socket.on("bidUpdate", handleBidUpdate);

    return () => {
      socket.off("auctionMessage", handleAuctionMessage);
      socket.off("bidUpdate", handleBidUpdate);
      console.log(`Cleaned up listeners for auction: ${auctionId}`);
    };
  }, [auctionId, socket, joinAuction, getAuctionData]);

  // Sync with liveAuctions (runs when liveAuctions changes)
  useEffect(() => {
    const liveAuction = liveAuctions.find((a) => a.id === auctionId);
    if (liveAuction && JSON.stringify(liveAuction) !== JSON.stringify(auction)) {
      console.log("Syncing auction with liveAuctions:", liveAuction);
      setAuction((prev) => ({
        ...prev,
        currentBid: liveAuction.currentBid,
        bids: liveAuction.bids || prev?.bids || [],
        messages: liveAuction.messages || prev?.messages || [],
        status: liveAuction.status || prev?.status,
      }));
    }
  }, [liveAuctions, auctionId]);

  // Handle NEXT_LOT navigation (separate effect to avoid dependency conflicts)
  useEffect(() => {
    if (!socket || !auction || !allAuctions.length) return;

    const handleNextLot = ({ auctionId: msgAuctionId, actionType }) => {
      if (msgAuctionId === auctionId && actionType === "NEXT_LOT") {
        const currentCatalogAuctions = allAuctions.filter((a) => a.catalog === auction.catalog);
        const currentIndex = currentCatalogAuctions.findIndex((a) => a._id === auctionId);
        if (currentIndex < currentCatalogAuctions.length - 1) {
          const nextAuctionId = currentCatalogAuctions[currentIndex + 1]._id;
          console.log(`Navigating to next auction: ${nextAuctionId}`);
          router.push(`/catalog/${nextAuctionId}`);
        } else {
          toast.info("No more auctions in this catalog.");
        }
      }
    };

    socket.on("auctionMessage", handleNextLot);
    return () => {
      socket.off("auctionMessage", handleNextLot);
    };
  }, [socket, auctionId, auction, allAuctions, router]);

  const handlePlaceBid = async (bidAmount) => {
    if (!auction || !auction._id || !isJoined) {
      toast.error("Cannot place bid. Auction not joined or unavailable.");
      return;
    }
    if (!userId) {
      toast.error("Please log in to place a bid");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/placeBid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          auctionId: auction._id,
          bidAmount,
          bidType: "online",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place bid");
      }

      setAuction((prev) => ({
        ...prev,
        currentBid: bidAmount,
        bids: [...(prev.bids || []), { bidder: userId, bidAmount, bidTime: new Date(), bidType: "online" }],
      }));
      toast.success(`Bid of $${bidAmount.toLocaleString()} placed successfully!`);
    } catch (error) {
      console.error("Place Bid Error:", error);
      toast.error(error.message || "Failed to place bid");
    }
  };

  return (
    <>
      <div className="max-w-[1400px] flex min-h-screen bg-slate-50">
        {loading ? (
          <div className="fixed left-0 top-[70px] h-[calc(100vh-70px)] w-[350px] bg-white border-r border-slate-200 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Loading auctions...</p>
            </div>
          </div>
        ) : auction && allAuctions.length > 0 ? (
          <CatalogCarousel
            catalogName={auction.catalog}
            auctions={allAuctions.filter((a) => a.catalog === auction.catalog && a._id !== auction._id)}
            currentTime={new Date()}
            onSelectAuction={(auctionId) => router.push(`/catalog/${auctionId}`)}
          />
        ) : (
          <div className="fixed left-0 top-[70px] h-[calc(100vh-70px)] w-[350px] bg-white border-r border-slate-200 flex items-center justify-center">
            <p className="text-slate-600 font-medium">No auctions available</p>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 min-h-screen relative ml-[350px] bg-gradient-to-br from-slate-50 to-white"
        >
          <div className="max-w-6xl mx-auto px-8 py-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-8"
            >
              <CatalogHeader
                productName={headerData.productName}
                auctionEndDate={headerData.endDate}
                lotNumber={headerData.lotNumber}
                catalog={headerData.catalog}
                status={headerData.status}
              />
              <div className="mt-8">
                <CatalogDetails
                  product={product}
                  auction={auction}
                  loading={loading}
                  onBidNowClick={handlePlaceBid}
                  token={token}
                  notifications={notifications}
                  socket={socket}
                  messages={auction?.messages || []}
                  isJoined={isJoined}
                  setIsJoined={setIsJoined}
                  userId={userId}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}