"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, Shield } from "lucide-react";
import { setToken, setEmail, setUser } from "@/redux/authSlice";
import config from "@/app/config_BASE_URL";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    console.log("Setting loading to true");
    setLoading(true);

    try {
      console.log("Attempting login with:", { email: username });
      const loginResponse = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email: username,
        password,
      });

      console.log("Login response:", loginResponse.data);

      const { items } = loginResponse.data;
      const { token, user } = items;

      if (token && user) {
        console.log("Token received, verifying admin role...");
        dispatch(setToken(token));
        
        try {
          const verifyResponse = await axios.post(`${config.baseURL}/v1/api/auth/verify/${token}`);
          console.log("Verify response:", verifyResponse.data);

          if (verifyResponse.data.status && verifyResponse.data.items.role === "ADMIN") {
            dispatch(setUser(user));
            dispatch(setEmail(user.email));
            toast.success("Login successful!");
            router.push("/Admin/Admin-dashboard");
          } else {
            toast.error("You are not authorized as an admin.");
          }
        } catch (verifyError) {
          console.error("Error during verification:", verifyError);
          toast.error("Failed to verify admin role. Please try again.");
        }
      } else {
        console.error("No token or user data received");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error.response?.data || error.message);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Invalid credentials or server error.");
      }
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg"
              alt="Logo"
              width={80}
              height={80}
            />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-center text-gray-800 mb-2"
        >
          Admin Login
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-center text-gray-600 mb-8"
        >
          Secure access to your admin dashboard
        </motion.p>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email Address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                required
              />
            </div>
          </motion.div>

          <button
            type="submit"
            disabled={loading}
            onClick={() => console.log("Button clicked!")}
            className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 pointer-events-auto ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging In...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" /> Login
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center text-sm text-gray-500"
        >
          <Shield className="w-4 h-4 mr-2" />
          <span>Secure Admin Access</span>
        </motion.div>
      </motion.div>
    </div>
  );
}