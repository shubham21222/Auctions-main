"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectWalletBalance } from "@/redux/authSlice";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogFooter from "./CatalogFooter";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { useSocket } from "@/hooks/useSocket";

export default function CatalogPage() {
  const { slug } = useParams();
  const auctionId = slug;
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const walletBalance = useSelector(selectWalletBalance);

  const { socket, joinAuction: joinAuctionFromHook } = useSocket();

  const fetchAuctionAndProduct = useCallback(async () => {
    console.log("Fetching auction and product for:", { auctionId, token });
    if (!token || !auctionId) {
      console.log("Missing token or auctionId:", { token, auctionId });
      setLoading(false);
      toast.error("Missing token or auction ID");
      return;
    }

    setLoading(true);
    try {
      const auctionUrl = `${config.baseURL}/v1/api/auction/getbyId/${auctionId}`;
      console.log("Fetching auction from:", auctionUrl);
      const auctionResponse = await fetch(auctionUrl, {
        method: "GET",
        headers: { Authorization: `${token}` },
      });
      if (!auctionResponse.ok) {
        const errorText = await auctionResponse.text();
        console.log("Auction fetch failed with status:", auctionResponse.status, errorText);
        throw new Error(`Failed to fetch auction: ${auctionResponse.statusText}`);
      }
      const auctionData = await auctionResponse.json();
      console.log("Auction Response:", auctionData);

      if (auctionData.status && auctionData.items) {
        const auctionResult = auctionData.items;
        setAuction(auctionResult);
        console.log("Auction State Set:", auctionResult);

        const productId = auctionResult.product._id;
        if (!productId) throw new Error("Product ID not found in auction data");

        const productUrl = `${config.baseURL}/v1/api/product/${productId}`;
        console.log("Fetching product from:", productUrl);
        const productResponse = await fetch(productUrl, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
        if (!productResponse.ok) {
          const errorText = await productResponse.text();
          console.log("Product fetch failed with status:", productResponse.status, errorText);
          throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
        }
        const productData = await productResponse.json();
        console.log("Product Response:", productData);

        if (productData.status && productData.items) {
          setProduct({
            id: productData.items._id,
            name: productData.items.title,
            images: productData.items.image || ["/placeholder.svg"],
            description: productData.items.description,
            price: { min: productData.items.price, max: productData.items.price + 1000 },
          });
          console.log("Product State Set:", {
            id: productData.items._id,
            name: productData.items.title,
            images: productData.items.image,
            description: productData.items.description,
            price: { min: productData.items.price, max: productData.items.price + 1000 },
          });
        } else {
          console.log("Invalid product data:", productData);
          throw new Error("Invalid product data");
        }
      } else {
        console.log("Invalid auction data:", auctionData);
        throw new Error("Invalid auction data or no result found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to load auction or product details.");
      setAuction(null);
      setProduct(null);
    } finally {
      console.log("Fetch complete, loading set to false");
      setLoading(false);
    }
  }, [auctionId, token]);

  useEffect(() => {
    let isMounted = true;
    console.log("useEffect triggered for fetch with dependencies:", { auctionId, token });

    fetchAuctionAndProduct();

    return () => {
      isMounted = false;
      console.log("Cleanup: Component unmounted or dependencies changed");
    };
  }, [fetchAuctionAndProduct]);

  useEffect(() => {
    if (!socket || !auction) return;

    if (auction.auctionType === "LIVE") {
      joinAuctionFromHook(auctionId);
      console.log(`Joined LIVE auction room: ${auctionId}`);
    } else {
      console.log(`Auction ${auctionId} is ${auction.auctionType}, not connecting to socket`);
    }

    const handleBidUpdate = ({ auctionId: updatedAuctionId, bidAmount, userId: bidderId }) => {
      if (updatedAuctionId === auctionId) {
        setAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          currentBidder: bidderId,
        }));
        toast.success("New bid placed!");
      }
    };

    const handleAuctionEnded = ({ auctionId: endedAuctionId, winner }) => {
      if (endedAuctionId === auctionId) {
        setAuction((prev) => ({
          ...prev,
          status: "ENDED",
          winner: winner || null,
        }));
        toast.info("This auction has ended!");
      }
    };

    const handleOutbidNotification = ({ message, auctionId: notifiedAuctionId }) => {
      if (notifiedAuctionId === auctionId) {
        toast.error(message); // "You've been outbid!"
      }
    };

    const handleWinnerNotification = ({ message, auctionId: notifiedAuctionId, finalBid }) => {
      if (notifiedAuctionId === auctionId) {
        toast.success(`${message} Final Bid: $${finalBid}`);
      }
    };

    socket.on("bidUpdate", handleBidUpdate);
    socket.on("auctionEnded", handleAuctionEnded);
    socket.on("outbidNotification", handleOutbidNotification);
    socket.on("winnerNotification", handleWinnerNotification);

    return () => {
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("auctionEnded", handleAuctionEnded);
      socket.off("outbidNotification", handleOutbidNotification);
      socket.off("winnerNotification", handleWinnerNotification);
      console.log("Socket listeners cleaned up");
    };
  }, [socket, auction, auctionId, joinAuctionFromHook]);

  const handleBidNowClick = () => {
    // Placeholder for bidding logic
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 mt-[80px] min-h-screen">
        <CatalogHeader productName={product?.name} auctionEndDate={auction?.endDate} />
        <CatalogDetails
          product={product}
          auction={auction}
          loading={loading}
          walletBalance={walletBalance}
          onBidNowClick={handleBidNowClick}
          token={token}
        />
        <CatalogFooter />
      </div>
      <Footer />
    </>
  );
}