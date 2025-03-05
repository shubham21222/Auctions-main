"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectWalletBalance } from "@/redux/authSlice";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import CatalogHeader from "./CatalogHeader";
import CatalogDetails from "./CatalogDetails";
import CatalogFooter from "./CatalogFooter";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function CatalogPage() {
  const { slug } = useParams();
  const auctionId = slug; // Slug is now auctionId
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const walletBalance = useSelector(selectWalletBalance);

  useEffect(() => {
    const fetchAuctionAndProduct = async () => {
      console.log("Starting fetch with:", { auctionId, token });
      if (!token || !auctionId) {
        console.log("Missing token or auctionId:", { token, auctionId });
        setLoading(false);
        toast.error("Missing token or auction ID");
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching auction from:", `${config.baseURL}/v1/api/auction/getbyId/${auctionId}`);
        const auctionResponse = await fetch(`${config.baseURL}/v1/api/auction/getbyId/${auctionId}`, {
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
        });
        if (!auctionResponse.ok) {
          console.log("Auction fetch failed with status:", auctionResponse.status);
          const errorText = await auctionResponse.text();
          console.log("Auction fetch error response:", errorText);
          throw new Error(`Failed to fetch auction: ${auctionResponse.statusText}`);
        }
        const auctionData = await auctionResponse.json();
        console.log("Auction Response:", auctionData);

        if (auctionData.status && auctionData.items) {
          const auctionResult = auctionData.items;
          setAuction(auctionResult);
          console.log("Auction State Set:", auctionResult);

          const productId = auctionResult.product._id;
          if (!productId) {
            throw new Error("Product ID not found in auction data");
          }

          console.log("Fetching product from:", `${config.baseURL}/v1/api/product/${productId}`);
          const productResponse = await fetch(`${config.baseURL}/v1/api/product/${productId}`, {
            method: "GET",
            headers: {
              Authorization: `${token}`,
            },
          });
          if (!productResponse.ok) {
            console.log("Product fetch failed with status:", productResponse.status);
            const errorText = await productResponse.text();
            console.log("Product fetch error response:", errorText);
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
              price: {
                min: productData.items.price,
                max: productData.items.price + 1000,
              },
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
    };

    fetchAuctionAndProduct();
  }, [token, auctionId]);

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