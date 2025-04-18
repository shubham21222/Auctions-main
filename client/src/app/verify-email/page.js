"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setEmailVerified } from "@/redux/authSlice";
import config from "../config_BASE_URL";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("No verification token found");
        setVerifying(false);
        return;
      }

      try {
        // Send token in the request body instead of Authorization header
        const response = await axios.post(
          `${config.baseURL}/v1/api/auth/verify-email`,
          { token } // Send token in the body
        );

        if (response.data.status) {
          toast.success("Email verified successfully!");
          // Update Redux store with email verification status
          dispatch(setEmailVerified(true));
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            router.push("/");
          }, 2000);
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
                  onClick={() => router.push("/")} // Changed to /login for consistency
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
