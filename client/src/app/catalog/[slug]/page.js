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
      : "bg-blue-500"; // Use blue for admin messages (type: "info")
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
        const auctionResult = auctionData.items;
        setAuction(auctionResult);
        setLiveAuctions((prev) => {
          const exists = prev.find((a) => a.id === auctionId);
          if (!exists) return [...prev, { ...auctionResult, id: auctionId }];
          return prev.map((a) => (a.id === auctionId ? { ...a, ...auctionResult } : a));
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
    if (auction?.auctionType === "LIVE" && socket) {
      joinAuction(auctionId);
    }
  }, [socket, auction, auctionId, joinAuction]);

  useEffect(() => {
    const liveAuction = liveAuctions.find((a) => a.id === auctionId);
    if (liveAuction) {
      setAuction((prev) => ({ ...prev, ...liveAuction }));
    }
  }, [liveAuctions, auctionId]);

  const handlePlaceBid = async (bidAmount) => {
    if (!auction) return;
    if (auction.auctionType === "LIVE") {
      placeBid(auctionId, bidAmount);
    } else {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(bidAmount * 100),
            currency: "usd",
            metadata: { userId, auctionId, bidAmount, token },
          }),
        });
        if (!response.ok) throw new Error("Failed to create payment intent");
        const { clientSecret } = await response.json();
        router.push(
          `/checkout-intent?clientSecret=${clientSecret}&bidAmount=${bidAmount}&auctionId=${auctionId}&productId=${auction.product._id}&token=${token}&auctionType=${auction.auctionType}`
        );
      } catch (error) {
        console.error("Payment intent error:", error);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 mt-[80px] min-h-screen relative">
        <div className="fixed top-20 right-4 z-50 w-80">
          {notifications.map((notification) => (
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
          notifications={notifications} // Pass notifications to CatalogDetails
        />
        <CatalogFooter />
      </div>
      <Footer />
    </>
  );
}