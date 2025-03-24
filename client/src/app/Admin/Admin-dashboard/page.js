"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DollarSign, Users, Package, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("https://bid.nyelizabeth.com/v1/api/auction/getDashboardStats", {
          method: "GET",
          headers: {
            "Authorization": `${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || "API returned unsuccessful response");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  // Transform API data for charts
  const monthlySalesData = dashboardData?.monthlySales.map((item) => ({
    name: new Date(2025, item.month - 1).toLocaleString("default", { month: "short" }),
    total: item.totalSales,
  })) || [];

  const dailyVisitorsData = dashboardData?.weeklyVisitors.map((item) => ({
    name: item.day.slice(0, 3),
    visitors: item.visitors,
  })) || [];

  if (loading) {
    return <div className="text-center text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  // Calculate min and max for Y-axis domain to ensure proper scaling
  const visitorsValues = dailyVisitorsData.map((item) => item.visitors);
  const minVisitors = Math.min(...visitorsValues) * 0.9; // Add some padding below min
  const maxVisitors = Math.max(...visitorsValues) * 1.1; // Add some padding above max

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-600">Last Updated</p>
            <p className="text-sm font-medium text-gray-800">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg rounded-xl border-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.totalRevenue.toLocaleString() || "0"}</div>
              <div className="flex items-center mt-2">
                {dashboardData?.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <p className="text-xs opacity-80">
                  {Math.abs(dashboardData?.revenueChange || "0")}% from last month
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg rounded-xl border-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{dashboardData?.activeUsers.toLocaleString() || "0"}</div>
              <div className="flex items-center mt-2">
                {dashboardData?.userChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <p className="text-xs opacity-80">
                  {Math.abs(dashboardData?.userChange || "0")}% from last month
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg rounded-xl border-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
              <Package className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{dashboardData?.activeAuctions.toLocaleString() || "0"}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <p className="text-xs opacity-80">+0% from last month</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg rounded-xl border-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <ShoppingCart className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{dashboardData?.totalSales.count.toLocaleString() || "0"}</div>
              <div className="flex items-center mt-2">
                {dashboardData?.salesChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <p className="text-xs opacity-80">
                  {Math.abs(dashboardData?.salesChange || "0")}% since last period
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-4"
        >
          <Card className="shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-3"
        >
          <Card className="shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-800">Daily Visitors</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyVisitorsData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      domain={[minVisitors, maxVisitors]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#3b82f6", strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                      className="transition-all duration-300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}