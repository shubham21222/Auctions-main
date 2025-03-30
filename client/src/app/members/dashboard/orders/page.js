"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import config from "@/app/config_BASE_URL";

export default function OrdersPage() {
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/order/getAllOrders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        const sortedOrders = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setError("Please log in to view orders");
      setLoading(false);
    }
  }, [token]);

  // Filter orders based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.productsDetails?.[0]?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  // Animation variants for order cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      {/* Uncomment Header if needed */}
      {/* <Header /> */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 text-center mb-10 tracking-tight"
          >
            Your Orders
          </motion.h1>

          {/* Search Bar */}
          <div className="mb-10 relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search by product title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {loading ? (
            <div className="text-center text-gray-600 animate-pulse text-lg">Loading orders...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-lg">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">No orders found</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative h-64">
                    {order.productsDetails?.[0]?.image?.[0] ? (
                      <Image
                        src={order.productsDetails[0].image[0]}
                        alt={order.productsDetails[0].title || "Product Image"}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-xl"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-t-xl">
                        <span className="text-gray-500">No Image Available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 truncate">
                      {order.productsDetails?.[0]?.title || "Untitled Product"}
                    </h2>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">Order ID:</span> {order.OrderId}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">Total:</span> $
                      {order.totalAmount?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">Status:</span>{" "}
                      <span
                        className={`font-medium ${
                          order.paymentStatus === "PENDING" ? "text-yellow-600" : "text-green-600"
                        }`}
                      >
                        {order.paymentStatus || "Unknown"}
                      </span>
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">Placed:</span>{" "}
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">User:</span>{" "}
                      {order.userDetails?.name || "Unknown"} (
                      {order.userDetails?.email || "N/A"})
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Uncomment Footer if needed */}
      {/* <Footer /> */}
    </>
  );
}