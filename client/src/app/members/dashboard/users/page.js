"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Empty by default
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Get token from Redux store (assuming auth slice)
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        toast.error("Authentication required! Please log in.");
        setLoading(false);
        return;
      }

      try {
        const url = searchQuery
          ? `https://bid.nyelizabeth.com/v1/api/auth/getAllUsers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`
          : `https://bid.nyelizabeth.com/v1/api/auth/getAllUsers?page=${page}&limit=${limit}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []); // Use data directly, not data.users
          setTotalPages(data.pagination.totalPages || 1); // Set total pages from response
          toast.success("Users fetched successfully!");
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users!");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, page, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="text-2xl text-gray-600 animate-pulse">Loading Users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">User Directory</h1>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users by email or name..."
            className="w-full max-w-xl p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>

        {/* Users Grid */}
        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user._id} // Use _id from API response
                className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-800">{user.name || "Unnamed User"}</h2>
                <p className="text-gray-600">{user.email || "No email"}</p>
                <p className="text-sm text-gray-500">ID: {user._id}</p>
                <p className="text-sm text-gray-500">Role: {user.role || "N/A"}</p>
                <p className="text-sm text-gray-500">
                  Wallet Balance: ${user.walletBalance || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Payment Status: {user.Payment_Status || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No users found matching your search.</div>
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
            disabled={page === totalPages} // Disable if on last page
            className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;