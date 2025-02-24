"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function OrdersPage() {
    const auth = useSelector((state) => state.auth);
    const token = auth?.token || null; const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch orders from API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("http://localhost:4000/v1/api/order/getAllOrders", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`, // Pass token in Authorization header
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }

                const data = await response.json();
                // Sort orders by createdAt in descending order (latest first)
                const sortedOrders = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders); // Initially, filtered orders are the same as all orders
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
                order.productsDetails[0].title.toLowerCase().includes(searchQuery.toLowerCase())
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
            {/* <Header /> */}
            <div className="min-h-screen bg-gray-100 py-2 px-2 sm:px-6 lg:px-8">
                <div className=" mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold text-gray-900 text-center mb-8"
                    >
                     Orders
                    </motion.h1>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search by product title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-md mx-auto p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 animate-pulse">Loading orders...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center text-gray-500">No orders found</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredOrders.map((order) => (
                                <motion.div
                                    key={order._id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="relative h-[350px]">
                                        <Image
                                            src={order.productsDetails[0].image[0]}
                                            alt={order.productsDetails[0].title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-t-xl"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                                            {order.productsDetails[0].title}
                                        </h2>
                                        <p className="text-gray-600 mb-1">
                                            <span className="font-medium">Order ID:</span> {order.OrderId}
                                        </p>
                                        <p className="text-gray-600 mb-1">
                                            <span className="font-medium">Total:</span> ${order.totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-gray-600 mb-1">
                                            <span className="font-medium">Status:</span>{" "}
                                            <span
                                                className={`${order.paymentStatus === "PENDING" ? "text-yellow-600" : "text-green-600"
                                                    } font-medium`}
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </p>
                                        <p className="text-gray-600 mb-1">
                                            <span className="font-medium">Placed:</span>{" "}
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-600 mb-1">
                                            <span className="font-medium">User:</span> {order.userDetails.name} (
                                            {order.userDetails.email})
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}