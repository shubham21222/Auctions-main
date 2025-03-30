'use client';
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Home,
  Package,
  DollarSign,
  Tag,
  Truck,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Palette,
  Store,
  Activity,
  Gavel,
  Airplay,
  Settings,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import config from "@/app/config_BASE_URL";
import { removeToken, removeUser, setLoggedIn } from "@/redux/authSlice";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const user = auth?.user || null;
  const permissions = user?.permissions || [];

  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      router.push("/members/login");
    }
  }, [token, user, router]);

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

      if (!response.ok) throw new Error("Logout failed");

      dispatch(removeToken());
      dispatch(removeUser());
      dispatch(setLoggedIn(false));
      router.push("/members/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user) {
    return null;
  }

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  };

  const navItems = [
    { href: "/members/dashboard", icon: Home, label: "Dashboard", permission: "view dashboard" },
    { href: "/members/dashboard/buy-now", icon: Package, label: "Buy Now", permission: "view products" },
    { href: "/members/dashboard/private-sales", icon: DollarSign, label: "Private Sales", permission: "view private sales" },
    { href: "/members/dashboard/categories", icon: Tag, label: "Categories", permission: "view categories" },
    { href: "/members/dashboard/orders", icon: Truck, label: "Orders", permission: "view orders" },
    { href: "/members/dashboard/users", icon: Users, label: "Users", permission: "view users" },
    { href: "/members/dashboard/sellers", icon: UserCheck, label: "Sellers", permission: "view sellers" },
    { href: "/members/dashboard/brands", icon: Store, label: "Brands", permission: "view brands" },
    { href: "/members/dashboard/artists", icon: Palette, label: "Artists", permission: "view artists" },
    { href: "/members/dashboard/actions", icon: Activity, label: "Actions", permission: "view actions" },
    { href: "/members/dashboard/auctions", icon: Gavel, label: "Auctions", permission: "view auctions" },
    { href: "/members/dashboard/live-auctions", icon: Airplay, label: "Live Auctions", permission: "manage live auctions" },
  ].filter((item) => permissions.includes(item.permission));

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar */}
      <motion.aside
        className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 text-gray-700 shadow-lg relative overflow-hidden border-r border-blue-100"
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-blue-100">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Member Dashboard
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center w-full p-3 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <item.icon className="h-5 w-5 mr-3 text-blue-500" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </motion.div>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-blue-100">
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="border border-blue-100 rounded-xl px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 transition-all duration-200 bg-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 relative"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-blue-50 transition-all duration-200 ring-2 ring-blue-100"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/01.png" alt="@username" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white">
                      {user?.name?.[0]?.toUpperCase() || "M"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-72 bg-white shadow-lg rounded-xl p-2 border border-blue-100"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-800">{user?.name || "Member"}</p>
                    <p className="text-xs text-blue-600">{user?.email || "member@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-100" />
                {permissions.includes("edit settings") && (
                  <DropdownMenuItem className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-all duration-200">
                    <Settings className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-gray-800">Settings</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                  disabled={loading}
                >
                  <LogOut className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-gray-800">{loading ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardContent className="p-8">
              {permissions.includes("view dashboard") ? (
                children
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
                  <p className="text-gray-600">You do not have permission to view this page.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}