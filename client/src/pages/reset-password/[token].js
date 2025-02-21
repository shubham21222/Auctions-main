"use client"; // Ensure this is a client component in Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import config from "@/app/config_BASE_URL";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const ResetPassword = () => {
    const router = useRouter();
    const { token } = router.query; // Extract token from URL (e.g., /reset-password/[token])
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Animation variants for a smooth entrance
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            toast.error("All fields are required!", { position: "top-center" });
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!", { position: "top-center" });
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(
                `${config.baseURL}/v1/api/auth/resetPassword/${token}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }), // Payload: {"password": "Harshal@111"}
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            toast.success("Password reset successful!", { position: "top-center" });
            setTimeout(() => router.push("/"), 1000); // Redirect after 1s
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4">
                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Reset Your Password
                    </h2>

                    <div className="space-y-6">
                        {/* New Password Input */}
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="New Password"
                                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                🔒
                            </span>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                🔒
                            </span>
                        </div>

                        {/* Reset Button */}
                        <motion.button
                            onClick={handleResetPassword}
                            className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.05 }}
                            whileTap={{ scale: loading ? 1 : 0.95 }}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </motion.button>
                    </div>

                    {/* Token Display (Optional Debugging) */}
                    {token && (
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Token: <span className="font-mono text-blue-600">{token}</span>
                        </p>
                    )}

                    {/* Back to Login Link */}
                    <p className="text-center text-sm mt-4">
                        <Link
                            href="/"
                            className="text-blue-600 hover:underline transition-colors"
                        >
                            Back to Login
                        </Link>
                    </p>
                </motion.div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;