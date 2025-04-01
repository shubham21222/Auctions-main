 "use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import config from "@/app/config_BASE_URL";


const SellerDetailsPage = () => {
  const [sellerData, setSellerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(true); // Track if user is a seller
  const [expandedSections, setExpandedSections] = useState({});

  // Get user ID and token from Redux store (auth slice)
  const auth = useSelector((state) => state.auth);
  const userId = auth?._id;
  const token = auth?.token;

  useEffect(() => {
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
            toast.success("Seller data loaded successfully!");
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

    fetchSellerData();
  }, [userId, token]);

  const toggleSection = (sellerId, section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [`${sellerId}-${section}`]: !prev[`${sellerId}-${section}`],
    }));
  };

  const renderSection = (sellerId, title, data, isImageSection = false) => {
    const sectionKey = `${sellerId}-${title}`;
    const isExpanded = expandedSections[sectionKey];

    if (!data || (isImageSection && Object.keys(data).length === 0)) {
      return null; // Skip rendering if no data
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50"
      >
        <button
          onClick={() => toggleSection(sellerId, title)}
          className="w-full flex justify-between items-center text-xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
        >
          {title}
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2"
            >
              {isImageSection ? (
                Object.entries(data || {}).length > 0 ? (
                  Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-700 capitalize">
                        {key.replace("Image", " Image")}:
                      </span>
                      {value ? (
                        <Image
                          src={value}
                          alt={key}
                          width={80}
                          height={80}
                          className="object-cover rounded-md shadow-sm"
                        />
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No images or documents available</p>
                )
              ) : Object.entries(data || {}).length > 0 ? (
                Object.entries(data).map(([key, value]) => (
                  <p key={key} className="text-gray-600">
                    <span className="font-semibold">{key}:</span>{" "}
                    {typeof value === "object" && value
                      ? value.name || value.email || "N/A"
                      : value || "N/A"}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen mt-6 bg-gradient-to-br from-gray-100 to-blue-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
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
                It looks like you haven’t registered as a seller. Contact support or start selling to see your listings here.
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
              <h1 className="text-4xl font-bold mt-6  text-center mb-12 text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Listings
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sellerData.map((seller) => (
                  <motion.div
                    key={seller._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border border-gray-200/30"
                  >
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      Seller Listing #{seller._id.slice(-6)}
                    </h2>
                    <div className="space-y-6">
                      {renderSection(seller._id, "Category", seller.category)}
                      {renderSection(seller._id, "General", seller.General)}
                      {renderSection(seller._id, "Measurement", seller.Measurement)}
                      {renderSection(seller._id, "Condition", seller.Condition)}
                      {renderSection(seller._id, "Provenance", seller.Provenance)}
                      {renderSection(seller._id, "Price", seller.price)}
                      {renderSection(seller._id, "Images & Documents", seller.Documents, true)}
                      {renderSection(seller._id, "Logistics", seller.logistic_info)}
                      {renderSection(seller._id, "Metadata", {
                        "Seller ID": seller._id,
                        Approved: seller.Approved ? "Yes" : "No",
                        "Created By": seller.createdBy
                          ? `${seller.createdBy.name} (${seller.createdBy.email})`
                          : "N/A",
                        "Created At": seller.createdAt
                          ? new Date(seller.createdAt).toLocaleString()
                          : "N/A",
                        "Updated At": seller.updatedAt
                          ? new Date(seller.updatedAt).toLocaleString()
                          : "N/A",
                        "Approved By": seller.ApprovedBy
                          ? typeof seller.ApprovedBy === "string"
                            ? seller.ApprovedBy
                            : `${seller.ApprovedBy.name || "Admin"} (${seller.ApprovedBy.email || seller.ApprovedBy})`
                          : "N/A",
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerDetailsPage;