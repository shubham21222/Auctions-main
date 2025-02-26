"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id"); // Get orderId from query params
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    async function fetchSessionAndUpdateStatus() {
      if (sessionId && orderId && token) {
        try {
          // Step 1: Verify Stripe session
          const sessionResponse = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const sessionData = await sessionResponse.json();
          if (!sessionResponse.ok) throw new Error(sessionData.error || "Failed to verify session");
          setSessionData(sessionData);

          // Step 2: Update order status
          const updateResponse = await fetch("https://bid.nyelizabeth.com/v1/api/order/updateOrderStatus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${token}`, // Secure with token
            },
            body: JSON.stringify({
              _id: orderId,
              paymentStatus: "SUCCEEDED",
            }),
          });

          const updateData = await updateResponse.json();
          if (!updateResponse.ok) throw new Error(updateData.message || "Failed to update order status");
          setUpdateStatus(updateData);
        } catch (error) {
          console.error("Error in success handling:", error);
          toast.error(error.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    fetchSessionAndUpdateStatus();
  }, [sessionId, orderId, token]);

  // Animation variants for the checkmark
  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  // Animation variants for the background color change
  const backgroundVariants = {
    initial: { backgroundColor: "#ffffff" },
    animate: {
      backgroundColor: ["#ffffff", "#d4edda", "#cce5ff", "#f3e5f5", "#fff3e0", "#ffffff"],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center overflow-hidden relative"
      >
        {loading ? (
          <div className="text-gray-500 animate-pulse">Verifying your payment...</div>
        ) : (
          <>
            {/* Animated background behind the checkmark */}
            <motion.div
              variants={backgroundVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 rounded-full w-32 h-32 mx-auto top-[10px] z-0 opacity-50"
            />

            {/* Animated Checkmark */}
            <motion.div
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 relative z-10"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Your offer has been successfully submitted. We’ll notify you soon about the next steps.
            </p>
            {sessionId && (
              <p className="text-sm text-gray-500 mb-6">
                Transaction ID: <span className="font-mono">{sessionId}</span>
              </p>
            )}
            {sessionData && (
              <p className="text-sm text-gray-500 mb-6">
                Amount Paid: <span className="font-bold">${(sessionData.amount_total / 100).toLocaleString()}</span>
              </p>
            )}
            {updateStatus && (
              <p className="text-sm text-gray-500 mb-6">
                Order ID: <span className="font-mono">{orderId}</span> | 
                Status: <span className="font-bold text-green-500">{updateStatus.paymentStatus}</span>
              </p>
            )}
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Return to Home
              </motion.button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}