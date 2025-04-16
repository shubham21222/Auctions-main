"use client";
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import config from "../config_BASE_URL";

const VerificationModal = ({ isOpen, onClose, email, token }) => {
  const [verificationLoading, setVerificationLoading] = useState(false);

  const resendVerificationEmail = async () => {
    setVerificationLoading(true);
    try {
      await axios.post(
        `${config.baseURL}/v1/api/auth/send-verification-mail`,
        { email },
        { headers: { Authorization: `${token}` } }
      );
      toast.success("Verification email resent!");
    } catch (err) {
      console.error("Error resending verification:", err);
      toast.error("Failed to resend verification email");
    } finally {
      setVerificationLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-50 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>

            <div className="space-y-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">Verify Your Email</h3>
              <p className="text-gray-600">
                We've sent a verification link to {email}. Please check your inbox and click the link to verify your email address.
              </p>
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={resendVerificationEmail}
                  disabled={verificationLoading}
                  className="btn btn-outline"
                >
                  {verificationLoading ? "Sending..." : "Resend Verification Email"}
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerificationModal; 