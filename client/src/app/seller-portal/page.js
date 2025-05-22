"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SellerCard from "./components/SellerCard";
import SellerDetailsModal from "./components/SellerDetailsModal";
import EditSellerModal from "./components/EditSellerModal";
import config from "@/app/config_BASE_URL";

const SellerDetailsPage = () => {
  const [sellerData, setSellerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const auth = useSelector((state) => state.auth);
  const userId = auth?._id;
  const token = auth?.token;

  const fetchSellerData = async () => {
    if (!userId || !token) {
      toast.error("Authentication required! Please log in.");
      setLoading(false);
      setIsSeller(false);
      return;
    }

    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/seller/getByCreatedBy`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok && result.status) {
        if (result.items && result.items.length > 0) {
          setSellerData(result.items);
          setIsSeller(true);
        } else {
          setIsSeller(false);
          toast.error("You are not a seller or no seller data found.");
        }
      } else {
        setIsSeller(false);
        toast.error(result.message || "Failed to fetch seller data");
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
      toast.error("An error occurred while fetching seller data!");
      setIsSeller(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [userId, token]);

  const handleDelete = async (sellerId) => {
    if (!token) {
      toast.error("Authentication required!");
      return;
    }

    if (!confirm("Are you sure you want to delete this seller?")) return;

    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/seller/delete/${sellerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Seller deleted successfully!");
      setSellerData((prev) => prev.filter((seller) => seller._id !== sellerId));
      if (selectedSeller?._id === sellerId) {
        setSelectedSeller(null);
        setShowDetails(false);
      }
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("Failed to delete seller!");
    }
  };

  const handleUpdate = async (sellerId, updatedData) => {
    if (!token) {
      toast.error("Authentication required!");
      return;
    }

    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/seller/update/${sellerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status) {
        toast.success("Seller updated successfully!");
        // Update local state
        setSellerData((prev) =>
          prev.map((seller) =>
            seller._id === sellerId ? { ...seller, ...updatedData } : seller
          )
        );
        if (selectedSeller?._id === sellerId) {
          setSelectedSeller((prev) => ({ ...prev, ...updatedData }));
        }
      } else {
        throw new Error(result.message || "Failed to update seller");
      }
    } catch (error) {
      console.error("Error updating seller:", error);
      toast.error(error.message || "Failed to update seller!");
    }
  };

  const handleEdit = (seller) => {
    setSelectedSeller(seller);
    setShowEditModal(true);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen mt-6 py-12 ">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 text-center">
              <p className="text-xl text-gray-600 animate-pulse">Loading...</p>
            </div>
          ) : !isSeller ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 text-center">
              <p className="text-2xl font-semibold text-red-600">
                You are not a seller yet!
              </p>
              <p className="text-gray-600 mt-2">
                It looks like you haven&apos;t registered as a seller. Contact support or start selling to see your listings here.
              </p>
              <button
                onClick={() => window.location.href = "/contact"}
                className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          ) : sellerData.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 text-center">
              <p className="text-xl text-gray-600">No seller listings found.</p>
              <p className="text-gray-500 mt-2">Start adding your products to see them here!</p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Listings
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerData.map((seller) => (
                  <SellerCard
                    key={seller._id}
                    seller={seller}
                    onEdit={() => {
                      setSelectedSeller(seller);
                      setShowDetails(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Seller Details Modal */}
      {selectedSeller && (
        <SellerDetailsModal
          seller={selectedSeller}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedSeller(null);
          }}
          onEdit={() => {
            setShowDetails(false);
            setShowEditModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Seller Modal */}
      {selectedSeller && (
        <EditSellerModal
          seller={selectedSeller}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSeller(null);
          }}
          onUpdate={handleUpdate}
        />
      )}

      <Footer />
    </>
  );
};

export default SellerDetailsPage;