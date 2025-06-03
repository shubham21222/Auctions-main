"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setEmailVerified, removeToken, removeUser, clearEmail } from "@/redux/authSlice";
import config from "../config_BASE_URL";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSocket } from "@/hooks/useSocket";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { token, isEmailVerified } = useSelector((state) => state.auth);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const handleLogout = async () => {
    try {
      if (!token) {
        console.error("No token found in Redux state");
        return;
      }

      if (!isEmailVerified) {
        console.error("Email not verified yet");
        return;
      }

      const response = await fetch(`${config.baseURL}/v1/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (response.ok) {
        // Clear all Redux state
        dispatch(removeToken());
        dispatch(removeUser());
        dispatch(clearEmail());
        dispatch(setEmailVerified(false));
        
        // Clear any local storage if needed
        localStorage.clear();
        sessionStorage.clear();
        
        router.push("/");
      } else {
        const errorData = await response.json();
        console.error("Logout error:", errorData.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const productId = searchParams.get("productId");

      if (!token) {
        setError("No verification token found");
        setVerifying(false);
        return;
      }

      try {
        // First, try to get the redirect URL and product ID from storage
        const redirectUrl = localStorage.getItem("redirectAfterVerification") || 
                          sessionStorage.getItem("tempRedirectAfterVerification");
        const storedProductId = localStorage.getItem("productIdAfterVerification") || 
                              sessionStorage.getItem("tempProductIdAfterVerification");
        
        // If productId is in URL, use it; otherwise use stored one
        const finalProductId = productId || storedProductId;
        
        // Store in sessionStorage as backup
        if (redirectUrl) {
          sessionStorage.setItem("tempRedirectAfterVerification", redirectUrl);
        }
        if (finalProductId) {
          sessionStorage.setItem("tempProductIdAfterVerification", finalProductId);
        }

        const response = await axios.post(
          `${config.baseURL}/v1/api/auth/verify-email`,
          { token }
        );

        if (response.data.status) {
          toast.success("Email verified successfully!");
          dispatch(setEmailVerified(true));
          
          // Construct the final redirect URL
          let finalRedirectUrl = redirectUrl;
          if (finalProductId && !finalRedirectUrl) {
            // If we have a product ID but no redirect URL, construct one
            finalRedirectUrl = `${window.location.origin}/products/${finalProductId}`;
          }
          
          // Logout after successful verification
          await handleLogout();
          
          // If there's a redirect URL, navigate to it after a short delay
          if (finalRedirectUrl) {
            // Clear all storage locations
            localStorage.removeItem("redirectAfterVerification");
            localStorage.removeItem("productIdAfterVerification");
            sessionStorage.removeItem("tempRedirectAfterVerification");
            sessionStorage.removeItem("tempProductIdAfterVerification");
            localStorage.removeItem("verificationUrl");
            
            setTimeout(() => {
              router.push(finalRedirectUrl);
            }, 1500); // Short delay to show success message
          } else {
            // If no redirect URL, go to home page
            setTimeout(() => {
              router.push("/");
            }, 1500);
          }
        } else {
          setError(response.data.message || "Verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(err.response?.data?.message || "Failed to verify email");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router, dispatch]);

  // Add a message listener to handle cross-tab communication
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "redirectAfterVerification" || e.key === "productIdAfterVerification") {
        // If the redirect URL or product ID is updated in another tab, store it in sessionStorage
        if (e.newValue) {
          const storageKey = e.key === "redirectAfterVerification" 
            ? "tempRedirectAfterVerification" 
            : "tempProductIdAfterVerification";
          sessionStorage.setItem(storageKey, e.newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Remove the socket event listener since we're handling logout directly
  useEffect(() => {
    if (!socket) return;

    const handleEmailVerified = (data) => {
      if (data.isEmailVerified) {
        handleLogout();
      }
    };

    socket.on("emailVerified", handleEmailVerified);

    return () => {
      socket.off("emailVerified", handleEmailVerified);
    };
  }, [socket, router]);

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Email Verification
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {verifying ? "Verifying your email..." : error ? "Verification failed" : "Email verified successfully!"}
            </p>
          </div>

          <div className="mt-8">
            {verifying ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => router.push("/")}
                  className="btn btn-primary"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-green-500 mb-4">Your email has been verified successfully!</p>
                <p className="text-sm text-gray-600">Redirecting to login page...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
