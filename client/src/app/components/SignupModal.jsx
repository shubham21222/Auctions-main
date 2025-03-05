"use client";
import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import config from "../config_BASE_URL";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setToken, setUser, setUserId, setEmail, updateBillingDetails } from "@/redux/authSlice";

const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const getPasswordStrength = (password) => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 7) strength += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Step 1: Register the user
      const signupResponse = await axios.post(`${config.baseURL}/v1/api/auth/register`, {
        email,
        password,
        name,
      });

      if (!signupResponse.data.success) {
        throw new Error(signupResponse.data.message || "Registration failed.");
      }

      // Step 2: Login to get the token
      const loginResponse = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email,
        password,
      });

      if (!loginResponse.data.status || !loginResponse.data.items.success) {
        throw new Error(loginResponse.data.message || "Login failed after registration.");
      }

      // Extract token and user data from login response
      const token = loginResponse.data.items.token;
      const userData = loginResponse.data.items.user;

      if (!token || !userData) {
        throw new Error("No token or user data received from login response.");
      }

      if (!userData._id) {
        throw new Error("User data missing _id field.");
      }
      if (!userData.email) {
        throw new Error("User data missing email field.");
      }

      // Step 3: Store token and user data in Redux for auto-login
      try {
        dispatch(setToken(token));
        dispatch(setUser(userData));
        dispatch(setUserId(userData._id));
        dispatch(setEmail(userData.email));
      } catch (dispatchErr) {
        console.error("Dispatch error:", dispatchErr);
      }

      // Step 4: Verify the token and update billing details
      try {
        const verifyResponse = await axios.post(
          `${config.baseURL}/v1/api/auth/verify/${token}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (verifyResponse.data?.items && typeof verifyResponse.data.items === "object") {
          const verifiedUserData = verifyResponse.data.items;
          // Update user with verified data
          dispatch(setUser(verifiedUserData));
          // Dispatch billing details (even if empty)
          const billingDetails = verifiedUserData.BillingDetails && verifiedUserData.BillingDetails.length > 0
            ? verifiedUserData.BillingDetails[0] // Assuming single billing detail object
            : {};
          dispatch(updateBillingDetails(billingDetails));
        }
      } catch (verifyErr) {
        console.error("Verification error:", verifyErr.message);
        // Proceed even if verification fails, as it’s optional
      }

      // Success: Show toast and close modal
      toast.success("Sign up successful! You are now logged in.", {
        style: { background: "#32CD32", color: "#fff" },
        icon: "✅",
      });
      setLoading(false);
      onClose();
    } catch (err) {
      toast.error(err.message, {
        style: { background: "#FF4500", color: "#fff" },
        icon: "❌",
      });
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose(); // Close SignupModal
    onOpenLogin(); // Open LoginModal via parent callback
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-2xl w-full max-w-md p-8 relative z-50"
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>

              <div className="flex justify-center mb-8">
                <Image
                  src="https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg"
                  alt="Logo"
                  width={80}
                  height={80}
                />
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900">Create an account</h2>
              <p className="text-sm text-center text-gray-600 mt-3">
                Already have an account?{" "}
                <button
                  onClick={handleLoginClick}
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Login
                </button>
              </p>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-8"
                >
                  <p className="text-sm text-center text-gray-600 mb-8">
                    Creating an account allows you to place absentee and live bids, view auction
                    results, discover more, stay up to date, and manage your activity.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="label">
                        <span className="label-text text-sm font-medium text-gray-700">Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="input input-bordered w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text text-sm font-medium text-gray-700">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="input input-bordered w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        className="checkbox checkbox-primary mr-3"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(!acceptedTerms)}
                      />
                      <label htmlFor="terms" className="label-text text-sm text-gray-700">
                        I accept the{" "}
                        <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                          terms and conditions
                        </Link>
                      </label>
                    </div>
                    <button
                      className="btn btn-primary w-full mt-6"
                      onClick={() => setStep(2)}
                      disabled={!acceptedTerms || !name || !email}
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-8"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="label">
                        <span className="label-text text-sm font-medium text-gray-700">
                          Password Strength:
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="input input-bordered w-full"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full ${
                            passwordStrength === 3
                              ? "bg-green-500"
                              : passwordStrength === 2
                              ? "bg-yellow-500"
                              : passwordStrength === 1
                              ? "bg-red-500"
                              : "bg-gray-200"
                          }`}
                          style={{ width: `${(passwordStrength / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      7 or more characters<br />
                      Upper & lowercase characters<br />
                      At least one number or special character
                    </p>
                    <div className="flex justify-between mt-8">
                      <button className="btn btn-secondary" onClick={() => setStep(1)}>
                        Previous
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={passwordStrength < 3 || loading}
                      >
                        {loading ? "Signing up..." : "Sign up"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SignupModal;