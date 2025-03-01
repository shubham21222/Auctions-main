"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Home,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  LogOut,
  Tag,
  Truck,
  Users,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import config from "@/app/config_BASE_URL";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!token) {
      console.error("No token available for logout");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/Admin/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 text-white shadow-2xl transform transition-all duration-300 ease-in-out">
        <div className="p-6 flex items-center space-x-4 bg-gradient-to-r from-purple-700 to-indigo-700 border-b border-indigo-600/50">
          <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
            <span className="text-2xl font-extrabold text-white">NY</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
            NY Elizabeth
          </h2>
        </div>
        <nav className="p-4 space-y-3">
          <Link href="/Admin/Admin-dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <Home className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Dashboard
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/auctions">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <Package className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Auctions
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/buy-now">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Buy Now
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/private-sales">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <DollarSign className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Private Sales
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/category">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <Tag className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Category
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/orders">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <Truck className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Orders
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/users">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <Users className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Users
            </Button>
          </Link>
          <Link href="/Admin/Admin-dashboard/Sellers">
            <Button
              variant="ghost"
              className="w-full justify-start text-cyan-100 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600 hover:text-white transition-all duration-300 rounded-xl py-3 shadow-md hover:shadow-lg"
            >
              <UserCheck className="mr-3 h-5 w-5 text-cyan-300 group-hover:text-white transition-colors duration-200" />
              Sellers
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search auctions, orders..."
              className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-indigo-50 transition-all duration-200"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/01.png" alt="@username" />
                    <AvatarFallback className="bg-indigo-500 text-white">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-white shadow-lg rounded-lg p-2 border border-gray-100"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="flex items-center p-2 hover:bg-indigo-50 rounded-md transition-all duration-200">
                  <Settings className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-800">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center p-2 hover:bg-indigo-50 rounded-md transition-all duration-200 cursor-pointer"
                  disabled={loading}
                >
                  <LogOut className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-800">{loading ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Card className="border-0 shadow-lg rounded-xl bg-white">
            <CardContent className="p-6">{children}</CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};