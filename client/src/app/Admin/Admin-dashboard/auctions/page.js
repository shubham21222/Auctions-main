"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import AuctionForm from "./AuctionForm";
import AuctionList from "./AuctionList";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  // Fetch all auctions
  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/all`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch auctions");
      const data = await response.json();

      if (data.status && data.items?.formattedAuctions) {
        setAuctions(data.items.formattedAuctions);
        toast.success("Auctions loaded successfully!");
      } else {
        throw new Error(data.message || "Invalid auction data");
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${config.baseURL}/v1/api/category/all`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data.status) {
        setCategories(data.items || []);
      } else {
        throw new Error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      toast.error("Error fetching categories.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAuctions();
      fetchCategories();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Auctions</h2>
      <AuctionForm
        categories={categories}
        auctions={auctions}
        setAuctions={setAuctions}
        fetchAuctions={fetchAuctions}
        token={token}
      />
      <AuctionList auctions={auctions} loading={loading} token={token} fetchAuctions={fetchAuctions} />
    </div>
  );
}