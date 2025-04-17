"use client";
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import config from "../config_BASE_URL";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSelector } from "react-redux";

export function VerificationModal({ isOpen, onClose, email }) {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/auth/send-verification-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.status && data.items?.success) {
        toast.success(data.message || 'Verification email sent successfully!');
        onClose();
      } else {
        throw new Error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-white/95 to-white/90 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-gold/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-luxury-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-2xl font-semibold text-luxury-charcoal">
            Verify Your Email
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            Please verify your email address to continue bidding. We've sent a verification link to your email.
          </p>
          
          <div className="mb-6 p-3 bg-luxury-gold/5 rounded-lg border border-luxury-gold/20">
            <p className="text-sm text-luxury-charcoal">
              <span className="font-semibold text-luxury-gold">Note:</span> After verifying your email, please log out and log in again to access all features.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="w-full bg-luxury-gold text-white hover:bg-luxury-charcoal transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </div>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-luxury-gold/20 text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/5"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 