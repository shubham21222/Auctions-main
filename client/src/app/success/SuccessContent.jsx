// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import confetti from "canvas-confetti";
// import Link from "next/link";
// import { CheckCircle } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import toast from "react-hot-toast";
// import { updatePaymentStatus } from "@/redux/authSlice"; // Adjust path

// export default function SuccessContent() {
//   const searchParams = useSearchParams();
//   const success = searchParams.get("success");
//   const sessionId = searchParams.get("session_id"); // For Checkout Session (existing)
//   const orderId = searchParams.get("order_id"); // For order flow (existing)
//   const productId = searchParams.get("productId"); // For auction flow (existing)
//   const auctionId = searchParams.get("auctionId"); // Added for PaymentIntent
//   const paymentIntentId = searchParams.get("paymentIntentId"); // Added for PaymentIntent
//   const auth = useSelector((state) => state.auth);
//   const token = auth?.token || null;
//   const user = auth?.user || null;
//   const dispatch = useDispatch();

//   const [loading, setLoading] = useState(true);
//   const [sessionData, setSessionData] = useState(null); // For Checkout Session
//   const [paymentData, setPaymentData] = useState(null); // For PaymentIntent
//   const [updateStatus, setUpdateStatus] = useState(null);

//   useEffect(() => {
//     async function verifyPaymentAndUpdateStatus() {
//       try {
//         if (sessionId) {
//           // Existing Checkout Session flow
//           const sessionResponse = await fetch(`/api/verify-session?session_id=${sessionId}`);
//           if (!sessionResponse.ok) {
//             const errorData = await sessionResponse.json();
//             throw new Error(errorData.error || "Failed to verify session");
//           }
//           const sessionData = await sessionResponse.json();
//           setSessionData(sessionData);
//         } else if (paymentIntentId) {
//           // New PaymentIntent flow
//           const paymentResponse = await fetch(`/api/verify-payment-intent?paymentIntentId=${paymentIntentId}`);
//           if (!paymentResponse.ok) {
//             const errorData = await paymentResponse.json();
//             throw new Error(errorData.error || "Failed to verify payment");
//           }
//           const paymentData = await paymentResponse.json();
//           setPaymentData(paymentData);
//         }

//         // Update status based on context
//         let updateResponse;
//         if (orderId) {
//           // Existing order flow
//           updateResponse = await fetch("https://bid.nyelizabeth.com/v1/api/order/updateOrderStatus", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `${token}`,
//             },
//             body: JSON.stringify({
//               _id: orderId,
//               paymentStatus: "SUCCEEDED",
//             }),
//           });
//         } else if (productId || auctionId) {
//           // Auction flow (works for both flows)
//           updateResponse = await fetch("https://bid.nyelizabeth.com/v1/api/auction/updatePaymentStatus", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `${token}`,
//             },
//             body: JSON.stringify({
//               userId: user._id,
//               status: "PAID",
//             }),
//           });
//         }

//         if (!updateResponse || !updateResponse.ok) {
//           const errorData = await updateResponse?.json();
//           console.error("Update API error:", errorData);
//           throw new Error(errorData?.message || "Failed to update status");
//         }

//         const updateData = await updateResponse.json();
//         setUpdateStatus(updateData);

//         if (productId || auctionId) {
//           dispatch(updatePaymentStatus("PAID"));
//           console.log("Dispatched updatePaymentStatus to set Payment_Status to PAID");
//         }

//         confetti({
//           particleCount: 100,
//           spread: 70,
//           origin: { y: 0.6 },
//         });
//       } catch (error) {
//         console.error("Error in success handling:", error);
//         toast.error(error.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     }

//     verifyPaymentAndUpdateStatus();
//   }, [sessionId, orderId, productId, auctionId, paymentIntentId, success, token, user, dispatch]);

//   const checkmarkVariants = {
//     hidden: { scale: 0, opacity: 0 },
//     visible: {
//       scale: 1,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 },
//     },
//   };

//   const backgroundVariants = {
//     initial: { backgroundColor: "#ffffff" },
//     animate: {
//       backgroundColor: ["#ffffff", "#d4edda", "#cce5ff", "#f3e5f5", "#fff3e0", "#ffffff"],
//       transition: { duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-16 px-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center overflow-hidden relative"
//       >
//         {loading ? (
//           <div className="text-gray-500 animate-pulse">Verifying your payment...</div>
//         ) : sessionData || paymentData ? (
//           <>
//             <motion.div
//               variants={backgroundVariants}
//               initial="initial"
//               animate="animate"
//               className="absolute inset-0 rounded-full w-32 h-32 mx-auto top-[10px] z-0 opacity-50"
//             />
//             <motion.div
//               variants={checkmarkVariants}
//               initial="hidden"
//               animate="visible"
//               className="mb-6 relative z-10"
//             >
//               <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
//             </motion.div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Thank You!
//             </h1>
//             <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
//               {orderId
//                 ? "Your offer has been successfully submitted. We’ll notify you soon about the next steps."
//                 : "Your bid has been successfully placed. The payment is held until the auction ends. If you win, we’ll notify you; otherwise, the money will be returned."}
//             </p>
//             {sessionId && (
//               <p className="text-sm text-gray-500 mb-6">
//                 Transaction ID: <span className="font-mono">{sessionId}</span>
//               </p>
//             )}
//             {paymentIntentId && (
//               <p className="text-sm text-gray-500 mb-6">
//                 Transaction ID: <span className="font-mono">{paymentIntentId}</span>
//               </p>
//             )}
//             {sessionData && (
//               <p className="text-sm text-gray-500 mb-6">
//                 Amount Paid: <span className="font-bold">${(sessionData.amount_total / 100).toLocaleString()}</span>
//               </p>
//             )}
//             {paymentData && (
//               <p className="text-sm text-gray-500 mb-6">
//                 Amount Held: <span className="font-bold">${(paymentData.amount / 100).toLocaleString()}</span>
//               </p>
//             )}
//             {updateStatus && orderId && (
//               <p className="text-sm text-gray-500 mb-6">
//                 Order ID: <span className="font-mono">{orderId}</span> | Status:{" "}
//                 <span className="font-bold text-green-500">{updateStatus.paymentStatus}</span>
//               </p>
//             )}
//             <Link href={productId ? `/catalog/${productId}` : "/"}>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
//               >
//                 {productId ? "Return to Auction" : "Return to Home"}
//               </motion.button>
//             </Link>
//           </>
//         ) : (
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Payment Verification Failed
//             </h1>
//             <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
//               We couldn’t verify your payment or update your status. Please check your login status or contact support.
//             </p>
//             <Link href="/">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
//               >
//                 Return to Home
//               </motion.button>
//             </Link>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { updatePaymentStatus, selectPaymentDetails, clearPaymentDetails } from "@/redux/authSlice";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const productId = searchParams.get("productId");
  const auctionId = searchParams.get("auctionId");
  const paymentIntentId = searchParams.get("paymentIntentId");
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const user = auth?.user || null;
  const paymentDetails = useSelector(selectPaymentDetails); // Get payment details from Redux
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    async function verifyPaymentAndUpdateStatus() {
      try {
        console.log("Search Params:", {
          success,
          sessionId,
          orderId,
          productId,
          auctionId,
          paymentIntentId,
        });
        console.log("Redux Payment Details:", paymentDetails);

        // Use Redux payment details if available
        if (paymentDetails && paymentDetails.orderId === orderId) {
          setPaymentData({
            amount: paymentDetails.amount,
            id: paymentDetails.paymentIntentId,
          });
        } else if (paymentIntentId) {
          const paymentResponse = await fetch(`/api/verify-payment-intent?paymentIntentId=${paymentIntentId}`);
          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            console.error("PaymentIntent verification failed:", errorData);
            throw new Error(errorData.error || "Failed to verify payment");
          }
          const paymentData = await paymentResponse.json();
          console.log("PaymentIntent Data:", paymentData);
          setPaymentData(paymentData);
        } else if (sessionId) {
          const sessionResponse = await fetch(`/api/verify-session?session_id=${sessionId}`);
          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json();
            throw new Error(errorData.error || "Failed to verify session");
          }
          const sessionData = await sessionResponse.json();
          console.log("Session Data:", sessionData);
          setSessionData(sessionData);
        }

        let updateResponse;
        if (orderId) {
          updateResponse = await fetch("https://bid.nyelizabeth.com/v1/api/order/updateOrderStatus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              _id: orderId,
              paymentStatus: "SUCCEEDED",
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error("Update API error:", errorData);
            throw new Error(errorData?.message || "Failed to update status");
          }

          const updateData = await updateResponse.json();
          console.log("Update Status Data:", updateData);
          setUpdateStatus(updateData);

          // Fallback if no payment data yet
          if (!paymentData && !sessionId && !paymentDetails) {
            setPaymentData({ amount: updateData.items.totalAmount * 100 });
          }
        }

        if (productId || auctionId) {
          updateResponse = await fetch("https://bid.nyelizabeth.com/v1/api/auction/updatePaymentStatus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              userId: user._id,
              status: "PAID",
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error("Auction Update API error:", errorData);
            throw new Error(errorData?.message || "Failed to update auction status");
          }

          const updateData = await updateResponse.json();
          console.log("Auction Update Status Data:", updateData);
          setUpdateStatus(updateData);

          dispatch(updatePaymentStatus("PAID"));
          console.log("Dispatched updatePaymentStatus to set Payment_Status to PAID");
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Optional: Clear payment details after use
        dispatch(clearPaymentDetails());
      } catch (error) {
        console.error("Error in success handling:", error);
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    verifyPaymentAndUpdateStatus();
  }, [sessionId, orderId, productId, auctionId, paymentIntentId, success, token, user, dispatch, paymentDetails]);

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 },
    },
  };

  const backgroundVariants = {
    initial: { backgroundColor: "#ffffff" },
    animate: {
      backgroundColor: ["#ffffff", "#d4edda", "#cce5ff", "#f3e5f5", "#fff3e0", "#ffffff"],
      transition: { duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
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
        ) : sessionData || paymentData || (orderId && updateStatus) ? (
          <>
            <motion.div
              variants={backgroundVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 rounded-full w-32 h-32 mx-auto top-[10px] z-0 opacity-50"
            />
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
              {orderId
                ? "Your offer has been successfully submitted. We’ll notify you soon about the next steps."
                : "Your bid has been successfully placed. The payment is held until the auction ends. If you win, we’ll notify you; otherwise, the money will be returned."}
            </p>
            {sessionId && (
              <p className="text-sm text-gray-500 mb-6">
                Transaction ID: <span className="font-mono">{sessionId}</span>
              </p>
            )}
            {paymentData?.id && (
              <p className="text-sm text-gray-500 mb-6">
                Transaction ID: <span className="font-mono">{paymentData.id}</span>
              </p>
            )}
            {sessionData && (
              <p className="text-sm text-gray-500 mb-6">
                Amount Paid: <span className="font-bold">${(sessionData.amount_total / 100).toLocaleString()}</span>
              </p>
            )}
            {paymentData && (
              <p className="text-sm text-gray-500 mb-6">
                Amount Held: <span className="font-bold">${(paymentData.amount / 100).toLocaleString()}</span>
              </p>
            )}
            {updateStatus && orderId && (
              <p className="text-sm text-gray-500 mb-6">
                Order ID: <span className="font-mono">{orderId}</span> | Status:{" "}
                <span className="font-bold text-green-500">{updateStatus.paymentStatus}</span>
              </p>
            )}
            <Link href={productId || paymentDetails?.productId ? `/catalog/${productId || paymentDetails.productId}` : "/"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                {(productId || paymentDetails?.productId) ? "Return to Auction" : "Return to Home"}
              </motion.button>
            </Link>
          </>
        ) : (
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              We couldn’t verify your payment or update your status. Please check your login status or contact support.
            </p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Return to Home
              </motion.button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}