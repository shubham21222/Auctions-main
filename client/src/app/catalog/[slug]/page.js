"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogCarousel from "./CatalogCarousel";
import CatalogFooter from "./CatalogFooter";
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
      <div className="text-xs opacity-80 mt-1">
        {new Date().toLocaleTimeString()}
      </div>
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
  const {
    socket,
    liveAuctions,
    setLiveAuctions,
    joinAuction,
    placeBid,
    getAuctionData,
    notifications,
  } = useSocket();

  const fetchAuctionData = useCallback(async () => {
    if (!token || !auctionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const auctionResponse = await fetch(
        `${config.baseURL}/v1/api/auction/bulkgetbyId/${auctionId}`,
        {
          method: "GET",
          headers: { Authorization: `${token}` },
        }
      );
      if (!auctionResponse.ok) throw new Error("Failed to fetch auction");
      const auctionData = await auctionResponse.json();
      if (auctionData.status && auctionData.items) {
        const auctionResult = {
          ...auctionData.items,
          messages: Array.isArray(auctionData.items.messages)
            ? auctionData.items.messages
            : [],
          catalog:
            auctionData.items.category?.name ||
            auctionData.items.catalog ||
            "Uncategorized",
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

        if (
          Array.isArray(auctionResult.participants) &&
          auctionResult.participants.some((p) => p._id === userId)
        ) {
          setIsJoined(true);
        } else {
          try {
            const joinCheckResponse = await fetch(
              `${config.baseURL}/v1/api/auction/join`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `${token}`,
                },
                body: JSON.stringify({
                  auctionId: auctionResult._id,
                  userId: userId,
                }),
              }
            );
            const joinCheckData = await joinCheckResponse.json();
            if (joinCheckData.message === "User already joined the auction") {
              setIsJoined(true);
            }
          } catch (error) {
            console.error("Error checking join status:", error);
          }
        }

        setProduct({
          id: auctionResult.product?._id || "",
          name: auctionResult.product?.title || "Unnamed Item",
          images: Array.isArray(auctionResult.product?.image)
            ? auctionResult.product.image
            : [],
          description:
            auctionResult.product?.description ||
            "No additional description available.",
          price: {
            min: auctionResult.product?.price || 0,
            max: auctionResult.product?.price
              ? auctionResult.product.price + 1000
              : 1000,
          },
        });

        setLiveAuctions((prev) => {
          const exists = prev.find((a) => a.id === auctionId);
          return exists
            ? prev.map((a) =>
                a.id === auctionId
                  ? { ...a, ...auctionResult, id: auctionId }
                  : a
              )
            : [...prev, { ...auctionResult, id: auctionId }];
        });
      } else {
        throw new Error("Invalid auction data received");
      }

      const allAuctionsResponse = await fetch(
        `${config.baseURL}/v1/api/auction/bulk`,
        {
          method: "GET",
          headers: { Authorization: `${token}` },
        }
      );
      if (!allAuctionsResponse.ok)
        throw new Error("Failed to fetch all auctions");
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
      } else {
        throw new Error("Invalid all auctions data received");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [auctionId, token, setLiveAuctions, router, userId]);

  useEffect(() => {
    fetchAuctionData();
  }, [fetchAuctionData]);

  useEffect(() => {
    if (!auctionId || !socket) return;

    const isAlreadyJoined = Object.keys(socket.rooms || {}).includes(auctionId);
    if (!isAlreadyJoined) {
      joinAuction(auctionId);
      getAuctionData(auctionId);
      console.log(`Joined and requested data for auction: ${auctionId}`);
    } else {
      console.log(`Already joined auction: ${auctionId}`);
    }
  }, [auctionId, socket, joinAuction, getAuctionData]);

  useEffect(() => {
    const liveAuction = liveAuctions.find((a) => a.id === auctionId);
    if (liveAuction) {
      setAuction((prev) => ({
        ...prev,
        currentBid: liveAuction.currentBid,
        bids: liveAuction.bids || prev?.bids || [],
        messages: liveAuction.messages || prev?.messages || [],
        status: liveAuction.status || prev?.status,
        participants: liveAuction.participants || prev?.participants,
      }));
    }
  }, [liveAuctions, auctionId]);

  const handlePlaceBid = async (bidAmount) => {
    if (!auction || !auction._id) {
      toast.error("No active auction available");
      return;
    }
    if (!userId) {
      toast.error("Please log in to place a bid");
      return;
    }
    if (!isJoined) {
      toast.error("You must join the auction before placing a bid");
      return;
    }

    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/auction/placeBid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            auctionId: auction._id,
            bidAmount: bidAmount.toString(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to place bid");
      }

      setAuction((prev) => ({
        ...prev,
        currentBid: bidAmount,
        bids: [
          ...(prev.bids || []),
          { bidder: userId, bidAmount, bidTime: new Date() },
        ],
      }));

      if (socket && socket.connected) {
        socket.emit("placeBid", { auctionId: auction._id, bidAmount, userId });
      }

      toast.success(
        `Bid of $${bidAmount.toLocaleString()} placed successfully!`
      );
    } catch (error) {
      console.error("Place Bid Error:", error);
      toast.error(error.message || "Failed to place bid");
    }
  };

  return (
    <>
      <Header />

      {auction && (
        <CatalogCarousel
          catalogName={auction.catalog}
          auctions={allAuctions.filter(
            (a) => a.catalog === auction.catalog && a._id !== auction._id
          )}
          currentTime={new Date()}
          onSelectAuction={(auctionId) => router.push(`/catalog/${auctionId}`)}
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="fixed top-24 right-6 z-50 w-80 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold scrollbar-track-gray-800">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 py-2 mt-[80px] relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-luxury-gold/20"
          >
            <CatalogHeader
              productName={headerData.productName}
              auctionEndDate={headerData.endDate}
              lotNumber={headerData.lotNumber}
              catalog={headerData.catalog}
              status={headerData.status}
            />
            <div className="grid grid-cols-1 gap-10 p-8">
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
            <CatalogFooter />
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}