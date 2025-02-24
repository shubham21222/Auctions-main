"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { setToken, setEmail, setUser } from "@/redux/authSlice";
import config from "@/app/config_BASE_URL";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null; const [orders, setOrders] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginResponse = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email: username,
        password,
      });

      const { items } = loginResponse.data;
      const { token, user } = items;

      if (token && user) {
        dispatch(setToken(token));
        const verifyResponse = await axios.post(`${config.baseURL}/v1/api/auth/verify/${token}`);

        if (verifyResponse.data.status && verifyResponse.data.items.role === "ADMIN") {
          dispatch(setUser(user));
          dispatch(setEmail(user.email));
          toast.success("Login successful!");
          router.push("/Admin/Admin-dashboard");
        } else {
          toast.error("You are not authorized as an admin.");
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <Toaster position="top-right" />
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-200"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-200"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md flex items-center justify-center transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging In...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}