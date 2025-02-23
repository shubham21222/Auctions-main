import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // For the logo
import "../../app/globals.css";

// Password strength checker function
const checkPasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const conditionsMet = [
        password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
    ].filter(Boolean).length;

    if (conditionsMet === 5) return "strong";
    if (conditionsMet >= 3) return "medium";
    return "weak";
};

const ResetPassword = () => {
    const router = useRouter();
    const { token } = router.query;
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("weak");

    // Update password strength whenever password changes
    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(password));
    }, [password]);

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            toast.error("All fields are required!");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(
                `https://bid.nyelizabeth.com/v1/api/auth/resetPassword/${token}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: password }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            toast.success("Password reset successful!");
            router.push("/");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Determine if the button should be disabled
    const isButtonDisabled = loading || passwordStrength === "weak" || password !== confirmPassword;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all hover:scale-105">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Image
                            src="https://images.liveauctioneers.com/houses/logos/lg/nouriel_large.jpg?width=140&quality=80" // Replace with your logo path
                            alt="Logo"
                            width={100}
                            height={100}
                            className="object-contain"
                        />
                    </div>

                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Reset Your Password
                    </h2>

                    <div className="space-y-6">
                        {/* Password Input */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        <div className="text-sm">
                            <p>Password Strength: 
                                <span className={
                                    passwordStrength === "strong" ? "text-green-600 font-semibold" :
                                    passwordStrength === "medium" ? "text-yellow-600 font-semibold" :
                                    "text-red-600 font-semibold"
                                }>
                                    {" "}{passwordStrength}
                                </span>
                            </p>
                            <div className="w-full h-2 mt-1 rounded-full bg-gray-200">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        passwordStrength === "strong" ? "w-full bg-green-500" :
                                        passwordStrength === "medium" ? "w-2/3 bg-yellow-500" :
                                        "w-1/3 bg-red-500"
                                    }`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Must include: 8+ characters, uppercase, lowercase, number, special character
                            </p>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={handleResetPassword}
                            disabled={isButtonDisabled}
                            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                                isButtonDisabled
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Resetting...
                                </span>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </div>

                    {/* Back to Login Link */}
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Remember your password?{" "}
                        <Link href="/" className="text-blue-600 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;