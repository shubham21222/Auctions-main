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
import config from "@/app/config_BASE_URL";

const Notification = ({ type, message }) => {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500";
  return (
    <div className={`${bgColor} text-white p-2 rounded mb-2 shadow-lg`}>{message}</div>
  );
};

export default function CatalogPage() {
  const { slug } = useParams();
  const auctionId = slug;
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth._id);
  const router = useRouter();
  const { socket, liveAuctions, setLiveAuctions, joinAuction, placeBid, getAuctionData, notifications } =
    useSocket();

  useEffect(() => {
    if (socket && slug) {
      socket.emit("joinAuction", { auctionId: slug });
      console.log(`Joined auction room: ${slug}`);
    }
  }, [socket, slug]);

  useEffect(() => {
    if (!socket) return;

    const handleAuctionMessage = ({ auctionId, message, actionType, sender, timestamp }) => {
      console.log("Received auction message:", { auctionId, message, actionType, sender, timestamp });
      if (auctionId === slug) {
        setAuction(prev => {
          if (!prev) return prev;
          const newMessage = {
            message: message || actionType,
            timestamp: timestamp || new Date(),
            sender: typeof sender === "object" ? sender.name || "Admin" : sender || "Admin",
            type: "message"
          };
          console.log("Adding new message to state:", newMessage);
          return {
            ...prev,
            messages: [...(prev.messages || []), newMessage]
          };
        });
      }
    };

    socket.on("auctionMessage", handleAuctionMessage);

    return () => {
      socket.off("auctionMessage", handleAuctionMessage);
    };
  }, [socket, slug]);

  const fetchAuctionAndProduct = useCallback(async () => {
    if (!token || !auctionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const auctionResponse = await fetch(`${config.baseURL}/v1/api/auction/getbyId/${auctionId}`, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      if (!auctionResponse.ok) throw new Error("Failed to fetch auction");
      const auctionData = await auctionResponse.json();
      if (auctionData.status && auctionData.items) {
        const auctionResult = { ...auctionData.items, messages: auctionData.items.messages || [] };
        console.log("Fetched auction data:", auctionResult);
        setAuction(auctionResult);
        setLiveAuctions((prev) => {
          const exists = prev.find((a) => a.id === auctionId);
          if (!exists) {
            console.log(`Adding auction ${auctionId} to liveAuctions`);
            return [...prev, { ...auctionResult, id: auctionId }];
          }
          console.log(`Updating auction ${auctionId} in liveAuctions`);
          return prev.map((a) => (a.id === auctionId ? { ...a, ...auctionResult, id: auctionId } : a));
        });

        const productId = auctionResult.product._id;
        const productResponse = await fetch(`${config.baseURL}/v1/api/product/${productId}`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!productResponse.ok) throw new Error("Failed to fetch product");
        const productData = await productResponse.json();
        if (productData.status && productData.items) {
          setProduct({
            id: productData.items._id,
            name: productData.items.title,
            images: productData.items.image || ["/placeholder.svg"],
            description: productData.items.description,
            price: { min: productData.items.price, max: productData.items.price + 1000 },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [auctionId, token, setLiveAuctions]);

  useEffect(() => {
    fetchAuctionAndProduct();
    if (auctionId) getAuctionData(auctionId);
  }, [auctionId, fetchAuctionAndProduct, getAuctionData]);

  useEffect(() => {
    console.log("liveAuctions updated:", liveAuctions);
    const liveAuction = liveAuctions.find((a) => a.id === auctionId);
    if (liveAuction) {
      setAuction((prev) => {
        if (!prev) {
          console.log("Previous auction state is null, setting new state:", liveAuction);
          return { ...liveAuction, messages: [] };
        }
        const updatedAuction = { ...prev, ...liveAuction, messages: prev.messages || [] };
        console.log("Updated auction state with liveAuction data:", updatedAuction);
        return updatedAuction;
      });
    } else {
      console.log(`No liveAuction found for auctionId: ${auctionId} in liveAuctions:`, liveAuctions);
    }
  }, [liveAuctions, auctionId]);

  const handlePlaceBid = async (bidAmount) => {
    if (!auction) return;

    // Remove the auctionType check and always use placeBid for both LIVE and timed auctions
    placeBid(auctionId, bidAmount);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen relative">
        <div className="fixed top-20 right-4 z-50 w-80">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 py-8 mt-[80px]">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <CatalogHeader productName={product?.name} auctionEndDate={auction?.endDate} />
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 p-6">
              <div className="lg:col-span-7 space-y-6">
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
            </div>
            <CatalogFooter />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}