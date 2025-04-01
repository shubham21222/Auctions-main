"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setToken, setEmail, setUser, setUserId } from '@/redux/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import config from "@/app/config_BASE_URL";
const MemberLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Step 1: Send login request
      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/login`,
        formData
      );

      const { status, message, items } = response.data;

      // Handle login failure
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
        return;
      }

      // Step 2: Handle successful login
      const { token, user } = items;
      if (!token || !user) {
        throw new Error("No token or user data received");
      }

      // Dispatch user data to Redux
      dispatch(setToken(token));
      dispatch(setUser(user));
      dispatch(setUserId(user._id));
      dispatch(setEmail(user.email));

      // Step 3: Verify token and get additional user data
      try {
        const verifyResponse = await axios.post(
            `${config.baseURL}/v1/api/auth/verify/${token}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { status: verifyStatus, items: verifyItems } = verifyResponse.data;
        if (verifyStatus && verifyItems) {
          const verifiedUserData = verifyItems;
          // Update user with verified data
          dispatch(setUser({ ...verifiedUserData, token }));
        }
      } catch (verifyErr) {
        console.error("Verification error:", verifyErr);
        toast("Login successful, but verification failed. Using basic user data.", {
          style: { background: "#FFD700", color: "#000" },
          icon: "⚠️",
        });
      }

      toast.success('Login successful!');
      router.push('/members/dashboard');

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Member Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please login to your account
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-colors duration-200`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-colors duration-200`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberLogin;