"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Get token from Redux store (assuming auth slice)
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    const fetchSellers = async () => {
      if (!token) {
        toast.error("Authentication required! Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${config.baseURL}/v1/api/seller/all?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === "All Sellers") {
          setSellers(data.message.sellers || []);
          setTotalPages(data.message.totalPages || 1);
          toast.success("Sellers fetched successfully!");
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
        toast.error("Failed to fetch sellers!");
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [token, page]);

  const handleApprove = async (sellerId) => {
    if (!token) {
      toast.error("Authentication required!");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/seller/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          ApprovalByAdmin: "true",
          id: sellerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success("Seller approved successfully!");
      // Update local state to reflect approval
      setSellers((prevSellers) =>
        prevSellers.map((seller) =>
          seller._id === sellerId ? { ...seller, Approved: true } : seller
        )
      );
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error("Failed to approve seller!");
    }
  };

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
          method: "DELETE",
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Seller deleted successfully!");
      // Remove seller from local state
      setSellers((prevSellers) => prevSellers.filter((seller) => seller._id !== sellerId));
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("Failed to delete seller!");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="text-2xl text-gray-600 animate-pulse">Loading Sellers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Sellers Dashboard</h1>

        {/* Sellers Grid */}
        {sellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <div
                key={seller._id}
                className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {seller.General?.object || "Unnamed Item"}
                </h2>
                <p className="text-gray-600">
                  Artist: {seller.General?.Artist || "Unknown"}
                </p>
                <p className="text-gray-600">
                  Category: {seller.category?.name || "N/A"}
                </p>
                <p className="text-gray-600">
                  Seller: {seller.createdBy?.name || "Unknown"} (
                  {seller.createdBy?.email || "No email"})
                </p>
                <p className="text-gray-600">
                  Price: ${seller.price?.paidPrice || "N/A"} (
                  {seller.price?.currency || "N/A"})
                </p>
                <p className="text-gray-600">
                  Approved: {seller.Approved ? "Yes" : "No"}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(seller.createdAt).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {!seller.Approved && (
                    <button
                      onClick={() => handleApprove(seller._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(seller._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No sellers found.</div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-4 items-center">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellersPage;