"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import config from "@/app/config_BASE_URL";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle forgot password request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Send forgot password request to the backend
      const response = await axios.post(`${config.baseURL}/v1/api/auth/forgotPassword`, {
        email,
      });

      console.log("Forgot password response:", response.data);
      toast.success("A password reset link has been sent to your email.");
    } catch (error) {
      console.error("Error requesting password reset:", error.response?.data || error.message);
      toast.error("An error occurred while sending the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <div className="flex items-center justify-center min-h-screen border-1-black ">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <p className="text-center text-gray-500">
          Enter your email address to receive a password reset link.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full text-white bg-blue-900 hover:bg-blue-700">
            {loading ? "Sending reset link..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link href="/" className="text-blue-900  hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
    <Footer />
    </> 
  );
}