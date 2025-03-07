// pages/catalog/[slug].js
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectWalletBalance } from "@/redux/authSlice";
import config from "@/app/config_BASE_URL";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogFooter from "./CatalogFooter";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { useSocket } from "@/hooks/useSocket";

// Notification Display Component
const Notification = ({ type, message }) => {
  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  return (
    <div className={`${bgColor} text-white p-2 rounded mb-2 shadow-lg`}>
      {message}
    </div>
  );
};

export default function CatalogPage() {
  const { slug } = useParams();
  const auctionId = slug;
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const walletBalance = useSelector(selectWalletBalance);
  const userId = useSelector((state) => state.auth._id);
  const router = useRouter();
  const { socket, liveAuctions, joinAuction, notifications } = useSocket();

  const fetchAuctionAndProduct = useCallback(async () => {
    if (!token || !auctionId) {
      setLoading(false);
      addNotification("error", "Missing token or auction ID");
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
        const auctionResult = auctionData.items;
        setAuction(auctionResult);

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
        } else {
          throw new Error("Invalid product data");
        }
      } else {
        throw new Error("Invalid auction data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      addNotification("error", error.message || "Failed to load auction or product details.");
      setAuction(null);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [auctionId, token]);

  // Custom notification handler (local to CatalogPage)
  const [localNotifications, setLocalNotifications] = useState([]);
  const addNotification = (type, message) => {
    const id = Date.now();
    setLocalNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchAuctionAndProduct();
  }, [fetchAuctionAndProduct]);

  useEffect(() => {
    if (auction?.auctionType === "LIVE" && socket) {
      joinAuction(auctionId);
      addNotification("success", `You joined auction ${auctionId}`);
    }
  }, [socket, auction, auctionId, joinAuction]);

  useEffect(() => {
    if (liveAuctions.length > 0 && auction) {
      const updatedAuction = liveAuctions.find((a) => a.id === auctionId);
      if (updatedAuction) {
        setAuction((prev) => ({
          ...prev,
          currentBid: updatedAuction.currentBid || prev.currentBid,
          currentBidder: updatedAuction.currentBidder || prev.currentBidder,
          status: updatedAuction.status || prev.status,
          winner: updatedAuction.winner || prev.winner,
          watchers: updatedAuction.watchers || prev.watchers,
        }));
      }
    }
  }, [liveAuctions, auctionId]);

  const handlePlaceBid = async (bidAmount) => {
    if (!auction) {
      addNotification("error", "No auction data available.");
      return;
    }

    if (bidAmount <= auction.currentBid) {
      addNotification("error", `Bid must be higher than $${auction.currentBid}.`);
      return;
    }

    if (!userId) {
      addNotification("error", "User not authenticated.");
      return;
    }

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(bidAmount * 100),
          currency: "usd",
          metadata: {
            userId,
            auctionId,
            bidAmount,
            token,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const { clientSecret } = await response.json();
      router.push(
        `/checkout-intent?clientSecret=${clientSecret}&bidAmount=${bidAmount}&auctionId=${auctionId}&productId=${auction.product._id}&token=${token}&auctionType=${auction.auctionType}`
      );
    } catch (error) {
      console.error("Payment intent error:", error);
      addNotification("error", error.message || "Failed to initiate checkout.");
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 mt-[80px] min-h-screen relative">
        {/* Notification Display */}
        <div className="fixed top-20 right-4 z-50 w-80">
          {[...notifications, ...localNotifications].map((notification) => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
            />
          ))}
        </div>
        <CatalogHeader productName={product?.name} auctionEndDate={auction?.endDate} />
        <CatalogDetails
          product={product}
          auction={auction}
          loading={loading}
          onBidNowClick={handlePlaceBid}
          token={token}
        />
        <CatalogFooter />
      </div>
      <Footer />
    </>
  );
}