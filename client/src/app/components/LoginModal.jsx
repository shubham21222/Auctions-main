'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import login from "../../../public/login.webp";

const LoginModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>

              {/* Logo and Title */}
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
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Log in to your account</h2>
                <p className="text-sm text-gray-600 mb-6">Welcome back! Please enter your details.</p>
              </motion.div>

              {/* Login Form */}
              <motion.div 
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2.5 rounded-lg hover:opacity-90 transition-all duration-300 text-sm md:text-base"
                >
                  Login
                </motion.button>
                <div className="text-center text-sm text-gray-600">
                  <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="#" className="text-blue-600 hover:underline">Join</a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;