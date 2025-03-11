"use client";
import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToken, setEmail, setUser, setUserId, updateBillingDetails } from "@/redux/authSlice"; // Added updateBillingDetails
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import login from "../../../public/login.webp";
import config from "../config_BASE_URL";
import Link from "next/link";

const LoginModal = ({ isOpen, onClose, onOpenSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Send login request to the backend
      const response = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email: emailInput,
        password,
      });

      const { status, message, items } = response.data;

      // Check if the API indicates failure (status: false)
      if (!status) {
        const trimmedMessage = message.trim();
        if (trimmedMessage === "Invalid email") {
          toast.error("Invalid email. Please check your email address.", {
            style: { background: "#FF4500", color: "#fff" },
            icon: "❌",
          });
        } else if (trimmedMessage === "Invalid password") {
          toast.error("Invalid password. Please try again.", {
            style: { background: "#FF4500", color: "#fff" },
            icon: "❌",
          });
        } else {
          toast.error(trimmedMessage || "An error occurred. Please try again.", {
            style: { background: "#FF4500", color: "#fff" },
            icon: "❌",
          });
        }
        setLoading(false);
        return;
      }

      // Step 2: Handle successful login
      const { token, user } = items;
      if (!token || !user) {
        throw new Error("No token or user data received from the server.");
      }

      // Dispatch initial user data and token
      dispatch(setToken(token));
      dispatch(setUser(user));
      dispatch(setUserId(user._id));
      dispatch(setEmail(user.email));
      console.log("Initial user data saved in Redux:", user);

      // Step 3: Verify token and get additional user data (including billing details)
      try {
        const verifyResponse = await axios.post(
          `${config.baseURL}/v1/api/auth/verify/${token}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { status: verifyStatus, items: verifyItems } = verifyResponse.data;
        if (verifyStatus && verifyItems && typeof verifyItems === "object") {
          const verifiedUserData = verifyItems;
          console.log("Verified user data:", verifiedUserData);

          // Update user with verified data
          dispatch(setUser({ ...verifiedUserData, token }));

          // Dispatch billing details (even if empty)
          const billingDetails =
            verifiedUserData.BillingDetails && verifiedUserData.BillingDetails.length > 0
              ? verifiedUserData.BillingDetails[0] // Assuming single billing detail
              : {};
          dispatch(updateBillingDetails(billingDetails));
          console.log("Billing details dispatched:", billingDetails);
        } else {
          console.warn("No valid items in verify response:", verifyResponse.data);
        }
      } catch (verifyErr) {
        console.error("Verification error:", verifyErr.message);
        toast.success("Login successful, but verification failed. Using basic user data.", {
          style: { background: "#FFD700", color: "#000" },
          icon: "⚠️",
        });
      }

      // Show success toast notification
      toast.success("Login successful!", {
        style: { background: "#32CD32", color: "#fff" },
        icon: "✅",
      });

      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Error during login:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred. Please try again.";
      toast.error(errorMessage, {
        style: { background: "#FF4500", color: "#fff" },
        icon: "❌",
      });
      setLoading(false);
    }
  };

  // Handle "Join" click
  const handleJoinClick = () => {
    onOpenSignup();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg w-full max-w-[90%] md:max-w-3xl overflow-hidden relative"
            >
              {/* Left Side - Image */}
              <div className="w-full md:w-1/2 h-48 md:h-auto relative">
                <Image
                  src={login}
                  alt="Login Background"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />
              </div>

              {/* Right Side - Login Form */}
              <div className="w-full md:w-1/2 p-6 md:p-8 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ✕
                </button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <Image
                    src="https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="mb-4 w-16 h-16 md:w-20 md:h-20"
                  />
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                    Log in to your account
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">Welcome back! Please enter your details.</p>
                </motion.div>

                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2.5 rounded-lg hover:opacity-90 transition-all duration-300 text-sm md:text-base"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </motion.button>
                  <div className="text-center text-sm text-gray-600">
                    <Link href="/forget-password" className="text-blue-600 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={handleJoinClick}
                      className="text-blue-600 hover:underline focus:outline-none"
                    >
                      Join
                    </button>
                  </div>
                </motion.form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoginModal;