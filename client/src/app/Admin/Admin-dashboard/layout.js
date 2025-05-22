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
  ChevronLeft,
  ChevronRight,
  Palette,
  Store,
  ChevronDown,
  Mail
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
import { motion } from "framer-motion";
import config from "@/app/config_BASE_URL";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  };

  const navItems = [
    { href: "/Admin/Admin-dashboard", icon: Home, label: "Dashboard" },
    // "Auctions" will be handled separately as a dropdown
    { href: "/Admin/Admin-dashboard/buy-now", icon: ShoppingCart, label: "Buy Now" },
    // { href: "/Admin/Admin-dashboard/private-sales", icon: DollarSign, label: "Private Sales" },
    { href: "/Admin/Admin-dashboard/category", icon: Tag, label: "Category" },
    { href: "/Admin/Admin-dashboard/orders", icon: Truck, label: "Orders" },
    { href: "/Admin/Admin-dashboard/users", icon: Users, label: "Users" },
    { href: "/Admin/Admin-dashboard/Sellers", icon: UserCheck, label: "Sellers" },
    { href: "/Admin/Admin-dashboard/brands", icon: Store, label: "Brands" },
    { href: "/Admin/Admin-dashboard/artists", icon: Palette, label: "Artists" },
    // { href: "/Admin/Admin-dashboard/role-permissions", icon: UserCheck, label: "Roles" },
    // { href: "/Admin/Admin-dashboard/register-for-role", icon: UserCheck, label: "Staff" },
    { href: "/Admin/Admin-dashboard/newsletter", icon: Mail, label: "Newsletter" },
  ];

  const auctionSubItems = [
    { href: "/Admin/Admin-dashboard/auctions", label: "Auctions" },
    { href: "/Admin/Admin-dashboard/live-auctions", label: "Live Auctions" },
    { href: "/Admin/Admin-dashboard/ended", label: "Ended Auctions" },
  ];

  const userSubItems = [
    { href: "/Admin/Admin-dashboard/users", label: "Users" },
    { href: "/Admin/Admin-dashboard/role-permissions", label: "Roles" },
    { href: "/Admin/Admin-dashboard/register-for-role", label: "Staff" },
    // { href: "/Admin/Admin-dashboard/remove-staff", label: "Remove Staff" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Sidebar */}
      <motion.aside
        className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl relative overflow-hidden"
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Glassmorphism Header */}
        <div className="p-6 flex items-center justify-between bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-b border-gray-700/50">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">NY</span>
              </div>
              <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-200">
                NY Elizabeth
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            if (item.href === "/Admin/Admin-dashboard/users") {
              return (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center w-full p-3 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <Users className="h-5 w-5 mr-3 text-indigo-300" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium">Users</span>
                          <ChevronDown className="h-4 w-4 text-indigo-300" />
                        </div>
                      )}
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-full bg-gray-800 text-white shadow-lg rounded-lg p-2 border border-gray-700"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                  >
                    {userSubItems.map((subItem) => (
                      <DropdownMenuItem
                        key={subItem.href}
                        asChild
                        className="p-2 hover:bg-indigo-600 rounded-md transition-all duration-200"
                      >
                        <Link href={subItem.href}>
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center w-full p-3 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <item.icon className="h-5 w-5 mr-3 text-indigo-300" />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}

          {/* Auctions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center w-full p-3 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Package className="h-5 w-5 mr-3 text-indigo-300" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">Auctions</span>
                    <ChevronDown className="h-4 w-4 text-indigo-300" />
                  </div>
                )}
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-full bg-gray-800 text-white shadow-lg rounded-lg p-2 border border-gray-700"
              align="start"
              side="bottom"
              sideOffset={5}
            >
              {auctionSubItems.map((subItem) => (
                <DropdownMenuItem
                  key={subItem.href}
                  asChild
                  className="p-2 hover:bg-indigo-600 rounded-md transition-all duration-200"
                >
                  <Link href={subItem.href}>
                    <span className="text-sm">{subItem.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Decorative Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900/50 via-transparent to-gray-900/50 opacity-70" />
      </motion.aside>

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
              {/* <Bell className="h-5 w-5" /> */}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-indigo-50 transition-all duration-200"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/01.png" alt={auth?.user?.name} />
                    <AvatarFallback className="bg-indigo-500 text-white">
                      {auth?.user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
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
                    <p className="text-sm font-semibold text-gray-800">{auth?.user?.name || "Admin User"}</p>
                    <p className="text-xs text-gray-500">{auth?.user?.email || "admin@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="flex items-center p-2 hover:bg-indigo-50 rounded-md transition-all duration-200">
                  {/* <Settings className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-800">Settings</span> */}
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
            <CardContent className="p-2">{children}</CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}