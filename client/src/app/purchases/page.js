"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Calendar, DollarSign, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import config from "../config_BASE_URL";

const PurchasesPage = () => {
  const auth = useSelector((state) => state.auth);
  const userId = auth?._id; // Use _id from authSlice
  const token = auth?.token;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://bid.nyelizabeth.com/v1/api/order/getOrdersById/${userId}?page=1&limit=100`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.data.message === "Orders fetched successfully") {
          const fetchedOrders = response.data.orders || [];
          if (fetchedOrders.length === 0) {
            setError("You don't have any purchases.");
          } else {
            setOrders(fetchedOrders);
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch orders");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchOrders();
    } else {
      setError("User ID not available. Please log in to view your purchases.");
      setLoading(false);
    }
  }, [userId, token]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-[80px] pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Your Purchases
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore your order history, track your luxury acquisitions, and relive the excitement of your wins.
            </p>
          </motion.div>

          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-72 w-full rounded-lg bg-gray-300" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 text-lg">
              {error}
              {error === "User ID not available. Please log in to view your purchases." || error === "You don't have any purchases." ? (
                <Link href={error.includes("log in") ? "/" : "/Buy-now"}>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    {error.includes("log in") ? "Log In" : "Shop Now"}
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6" />
                      <h2 className="text-lg font-semibold">
                        Order #{order.OrderId || order._id.slice(-6)}
                      </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Product Image & Info */}
                        {order.productsDetails && order.productsDetails.length > 0 ? (
                          <div className="flex items-start gap-4">
                            <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={order.productsDetails[0].image[0] || "/placeholder.svg"}
                                alt={order.productsDetails[0].title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-gray-700 font-medium line-clamp-2">
                                {order.productsDetails[0].title}
                              </p>
                              <p className="text-gray-600 text-sm">
                                Price: ${order.productsDetails[0].price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600 text-sm italic">No product details available</p>
                        )}

                        {/* Total Amount */}
                        <div className="flex items-center gap-2 text-gray-800">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          <p className="font-semibold">
                            Total: ${order.totalAmount.toLocaleString()}
                          </p>
                        </div>

                        {/* Order Date */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Status */}
                        <p className="text-sm">
                          Status:{" "}
                          <span
                            className={`font-semibold ${
                              order.paymentStatus === "SUCCEEDED"
                                ? "text-green-600"
                                : order.paymentStatus === "PENDING"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PurchasesPage;