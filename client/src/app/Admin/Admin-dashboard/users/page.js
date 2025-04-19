"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Empty by default
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null });
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
          ? `${config.baseURL}/v1/api/auth/getAllUsers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`
          : `${config.baseURL}/v1/api/auth/getAllUsers?page=${page}&limit=${limit}`;

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

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${config.baseURL}/v1/api/user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.subCode === "User deleted successfully") {
        toast.success("User deleted successfully!");
        // Refresh the users list
        setUsers(users.filter(user => user._id !== userId));
        setDeleteDialog({ isOpen: false, userId: null });
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
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
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
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

        {/* Users Table */}
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  // Get IP from userAuctions bids
                  const latestBid = user.userAuctions?.reduce((latest, auction) => {
                    const auctionBids = auction.bids || [];
                    // Find the most recent bid with a non-empty IP address
                    const latestAuctionBid = auctionBids
                      .filter(bid => bid.ipAddress && bid.ipAddress.trim() !== "")
                      .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))[0];
                    
                    if (!latest || (latestAuctionBid && new Date(latestAuctionBid.bidTime) > new Date(latest.bidTime))) {
                      return latestAuctionBid;
                    }
                    return latest;
                  }, null);

                  // If no IP found in bids, try to get from orders
                  const latestOrder = user.userOrders?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                  
                  const ipAddress = latestBid?.ipAddress || latestOrder?.ipAddress || "N/A";
                  const lastActivity = latestBid?.bidTime || latestOrder?.createdAt;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name || "Unnamed User"}</div>
                            <div className="text-sm text-gray-500">{user.email || "No email"}</div>
                            <div className="text-xs text-gray-400">ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "ADMIN" 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {user.role || "N/A"}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.Payment_Status === "PAID" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {user.Payment_Status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Auctions: {user.userAuctions?.length || 0}
                        </div>
                        <div className="text-sm text-gray-900">
                          Orders: {user.userOrders?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, userId: user._id })}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-600 py-8">No users found matching your search.</div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteDialog({ isOpen: false, userId: null })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteDialog.userId)}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
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

export default UsersPage;