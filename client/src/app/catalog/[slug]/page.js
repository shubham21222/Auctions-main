"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogFooter from "./CatalogFooter";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { motion } from "framer-motion";

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
      className={`${bgColor} text-white p-3 rounded-lg mb-3 shadow-lg border border-opacity-20 border-white`}
    >
      {message}
    </motion.div>
  );
};

export default function CatalogPage() {
  const { slug } = useParams();
  const auctionId = slug;
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headerData, setHeaderData] = useState({
    productName: "Loading...",
    lotNumber: "N/A",
    catalog: "Uncategorized",
    endDate: null,
    status: "Loading"
  });
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth._id);
  const router = useRouter();
  const { socket, liveAuctions, setLiveAuctions, joinAuction, placeBid, getAuctionData, notifications } =
    useSocket();

  // Fetch initial auction data from API
  const fetchAuctionData = useCallback(async () => {
    if (!token || !auctionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const auctionResponse = await fetch(
        `https://bid.nyelizabeth.com/v1/api/auction/bulkgetbyId/${auctionId}`,
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
          messages: auctionData.items.messages || [],
          catalog: auctionData.items.category?.name || auctionData.items.catalog || "Uncategorized",
        };
        
        setAuction(auctionResult);
        setHeaderData({
          productName: auctionResult.product?.title || "Unnamed Item",
          lotNumber: auctionResult.lotNumber || "N/A",
          catalog: auctionResult.catalog,
          endDate: auctionResult.endDate,
          status: auctionResult.status || "Loading"
        });

        setProduct({
          id: auctionResult.product._id,
          name: auctionResult.product.title,
          images: Array.isArray(auctionResult.product.image) ? auctionResult.product.image : [],
          description: auctionResult.product.description || "No additional description available.",
          price: {
            min: auctionResult.product.price || 0,
            max: auctionResult.product.price ? auctionResult.product.price + 1000 : 1000,
          },
        });

        setLiveAuctions((prev) => {
          const exists = prev.find((a) => a.id === auctionId);
          return exists
            ? prev.map((a) => (a.id === auctionId ? { ...a, ...auctionResult, id: auctionId } : a))
            : [...prev, { ...auctionResult, id: auctionId }];
        });
      }
    } catch (error) {
      console.error("Error fetching auction data:", error);
      router.push("/auction-calendar");
    } finally {
      setLoading(false);
    }
  }, [auctionId, token, setLiveAuctions, router]);

  // Initial data fetch and socket join
  useEffect(() => {
    fetchAuctionData();
    if (auctionId && socket) {
      getAuctionData(auctionId);
      socket.emit("joinAuction", { auctionId });
    }
  }, [auctionId, socket, fetchAuctionData, getAuctionData]);

  // Handle socket connection and auction messages
  useEffect(() => {
    if (!socket) return;

    const handleAuctionMessage = ({ auctionId: msgAuctionId, message, actionType, sender, timestamp }) => {
      if (msgAuctionId === auctionId) {
        setAuction((prev) => {
          if (!prev) return prev;
          const newMessage = {
            message: message || actionType,
            timestamp: timestamp || new Date(),
            sender: typeof sender === "object" ? sender.name || "Admin" : sender || "Admin",
            type: "message",
          };
          return {
            ...prev,
            messages: [...(prev.messages || []), newMessage],
          };
        });
      }
    };

    const handleAuctionUpdate = (updatedAuction) => {
      if (updatedAuction.id === auctionId) {
        setAuction((prev) => ({
          ...prev,
          currentBid: updatedAuction.currentBid,
          status: updatedAuction.status,
          participants: updatedAuction.participants
        }));
        
        setHeaderData(prev => ({
          ...prev,
          status: updatedAuction.status || prev.status
        }));
      }
    };

    socket.on("auctionMessage", handleAuctionMessage);
    socket.on("auctionUpdate", handleAuctionUpdate);
    socket.on("connect", () => {
      console.log("Connected to auction server!");
    });

    return () => {
      socket.off("auctionMessage", handleAuctionMessage);
      socket.off("auctionUpdate", handleAuctionUpdate);
      socket.off("connect");
    };
  }, [socket, auctionId]);

  const handlePlaceBid = async (bidAmount) => {
    if (!auction) return;
    placeBid(auctionId, bidAmount);
  };

  return (
    <>
      <Header />
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

        <div className="container mx-auto px-6 py-12 mt-[80px] relative z-10">
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