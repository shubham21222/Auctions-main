"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import config from "../config_BASE_URL";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  updatePaymentMethod,
  verifyEmail,
  setToken,
  setEmailVerified,
  fetchUserProfile
} from "@/redux/authSlice";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe('pk_live_5g1wJkC7k0nwGoGDbLp6zVBZ');

const PaymentForm = ({ token, onSuccess, billingDetails, email, dispatch }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: email,
          phone: billingDetails.phone || "",
          address: {
            line1: billingDetails.streetAddress || "",
            city: billingDetails.city || "",
            state: billingDetails.state || "",
            postal_code: billingDetails.zipcode || "",
            country: 'US'
          }
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/add-card`,
        { 
          paymentMethodId: paymentMethod.id,
          BillingDetails: {
            ...billingDetails,
            name: cardholderName,
            email: email
          }
        },
        { headers: { Authorization: `${token}` } }
      );

      if (response.data.status) {
        toast.success("Payment method added successfully!");
        dispatch(updatePaymentMethod(paymentMethod.id));
        onSuccess();
      } else {
        setError(response.data.error || "Failed to add payment method");
      }
    } catch (err) {
      console.error("Error in add-card:", err);
      setError(err.response?.data?.message || err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label">
          <span className="label-text text-sm font-medium text-gray-700">Name on Card</span>
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <label className="label">
          <span className="label-text text-sm font-medium text-gray-700">Card Details</span>
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#9e2146' },
              },
            }}
          />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={!stripe || loading}
      >
        {loading ? "Processing..." : "Add Card"}
      </button>
    </form>
  );
};

const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setLocalToken] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    company_name: "",
    streetAddress: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
    email: "",
    orderNotes: "",
  });
  const dispatch = useDispatch();
  const reduxToken = useSelector((state) => state.auth.token);
  const isEmailVerified = useSelector((state) => state.auth.isEmailVerified);

  useEffect(() => {
    if (isEmailVerified && step === 5) {
      toast.success("Email already verified!");
      onClose();
    }
  }, [isEmailVerified, step, onClose]);

  if (!isOpen) return null;

  const getPasswordStrength = (password) => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 7) strength += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const getProgress = () => {
    return (step / 5) * 100;
  };

  const handleSubmit = async (skipBilling = false) => {
    setLoading(true);
    try {
      const userData = {
        email,
        password,
        name,
        temp_password: "false",
      };
      if (!skipBilling) userData.BillingDetails = billingDetails;

      const result = await dispatch(registerUser(userData)).unwrap();
      dispatch(setToken(result.token));
      await dispatch(fetchUserProfile());

      setLocalToken(result.token);
      toast.success("Registration successful! Please check your email to verify your account.", {
        duration: 5000,
      });
      setStep(4);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err || "Something went wrong. Try again.", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    onOpenLogin();
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentSuccess = async () => {
    await dispatch(fetchUserProfile());
    toast.success("Payment method added successfully!");
    setStep(5);
  };

  const handleVerifyEmail = async () => {
    try {
      const result = await dispatch(verifyEmail(token || reduxToken)).unwrap();
      await dispatch(fetchUserProfile());
      toast.success("Email verified successfully!");
      dispatch(setEmailVerified(true));
      onClose();
    } catch (err) {
      toast.error(err || "Failed to verify email. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/send-verification-mail`,
        { email: email }
      );
      if (response.data.status) {
        toast.success("Verification email resent successfully!");
      } else {
        toast.error(response.data.error || "Failed to resend verification email");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification email");
    }
  };

  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-8 relative z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>

              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>

              <div className="flex justify-center mb-6 sm:mb-8">
                <Image
                  src="https://img1.wsimg.com/isteam/ip/05b280c7-f839-4e4d-9316-4bf01d28f2df/logo/b9e8f767-116c-4444-aab2-66386e072ec2.png"
                  alt="Logo"
                  width={60}
                  height={60}
                  className="sm:w-20 sm:h-20"
                />
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create an account</h2>
                <p className="text-sm text-gray-600 mt-2 sm:mt-3">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    onClick={handleLoginClick} 
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    Login
                  </button>
                </p>
              </div>

              <div className="flex justify-between mt-6 sm:mt-8 mb-4 sm:mb-6">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`flex items-center ${step >= num ? "text-blue-600" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 text-sm sm:text-base ${
                        step >= num ? "border-blue-600" : "border-gray-300"
                      }`}
                    >
                      {num}
                    </div>
                  </div>
                ))}
              </div>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-6 sm:mt-8"
                >
                  <p className="text-sm text-center text-gray-600 mb-6 sm:mb-8">
                    Creating an account allows you to place absentee and live bids, view auction
                    results, discover more, stay up to date, and manage your activity.
                  </p>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="label">
                        <span className="label-text text-sm font-medium text-gray-700">Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="input input-bordered w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text text-sm font-medium text-gray-700">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="input input-bordered w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="checkbox checkbox-primary mt-1 mr-3"
                        checked={acceptedTerms}
                        onChange={() => setAcceptedTerms(!acceptedTerms)}
                      />
                      <label htmlFor="terms" className="label-text text-sm text-gray-700">
                        I accept the{" "}
                        <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                          terms and conditions
                        </Link>
                      </label>
                    </div>
                    <button
                      className="btn btn-primary w-full mt-4 sm:mt-6"
                      onClick={() => setStep(2)}
                      disabled={!acceptedTerms || !name || !email}
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="label">
                        <span className="label-text text-sm font-medium text-gray-700">
                          Password Strength:
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="input input-bordered w-full"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full ${
                            passwordStrength === 3
                              ? "bg-green-500"
                              : passwordStrength === 2
                              ? "bg-yellow-500"
                              : passwordStrength === 1
                              ? "bg-red-500"
                              : "bg-gray-200"
                          }`}
                          style={{ width: `${(passwordStrength / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      7 or more characters<br />
                      Upper & lowercase characters<br />
                      At least one number or special character
                    </p>
                    <div className="flex justify-between mt-6 sm:mt-8">
                      <button className="btn btn-secondary" onClick={() => setStep(1)}>
                        Previous
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => setStep(3)}
                        disabled={passwordStrength < 3}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-sm text-center text-gray-600">
                      Add your billing details (optional)
                    </p>
                    <div className="space-y-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text text-sm font-medium text-gray-700">First Name</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            className="input input-bordered w-full"
                            value={billingDetails.firstName}
                            onChange={handleBillingChange}
                          />
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text text-sm font-medium text-gray-700">Last Name</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            className="input input-bordered w-full"
                            value={billingDetails.lastName}
                            onChange={handleBillingChange}
                          />
                        </div>
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="label">
                          <span className="label-text text-sm font-medium text-gray-700">Company Name</span>
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          placeholder="Company Name"
                          className="input input-bordered w-full"
                          value={billingDetails.company_name}
                          onChange={handleBillingChange}
                        />
                      </div>

                      {/* Street Address */}
                      <div>
                        <label className="label">
                          <span className="label-text text-sm font-medium text-gray-700">Street Address</span>
                        </label>
                        <input
                          type="text"
                          name="streetAddress"
                          placeholder="Street Address"
                          className="input input-bordered w-full"
                          value={billingDetails.streetAddress}
                          onChange={handleBillingChange}
                        />
                      </div>

                      {/* City, State, ZIP */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text text-sm font-medium text-gray-700">City</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            className="input input-bordered w-full"
                            value={billingDetails.city}
                            onChange={handleBillingChange}
                          />
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text text-sm font-medium text-gray-700">State</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            placeholder="State"
                            className="input input-bordered w-full"
                            value={billingDetails.state}
                            onChange={handleBillingChange}
                          />
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text text-sm font-medium text-gray-700">ZIP</span>
                          </label>
                          <input
                            type="text"
                            name="zipcode"
                            placeholder="ZIP Code"
                            className="input input-bordered w-full"
                            value={billingDetails.zipcode}
                            onChange={handleBillingChange}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="label">
                          <span className="label-text text-sm font-medium text-gray-700">Phone</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          className="input input-bordered w-full"
                          value={billingDetails.phone}
                          onChange={handleBillingChange}
                        />
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="label">
                          <span className="label-text text-sm font-medium text-gray-700">Order Notes</span>
                        </label>
                        <textarea
                          name="orderNotes"
                          placeholder="Any special instructions?"
                          className="textarea textarea-bordered w-full h-24"
                          value={billingDetails.orderNotes}
                          onChange={handleBillingChange}
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                      <button 
                        className="btn btn-secondary w-full sm:w-auto" 
                        onClick={() => setStep(2)}
                      >
                        Previous
                      </button>
                      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button
                          className="btn btn-outline w-full sm:w-auto"
                          onClick={() => handleSubmit(true)}
                          disabled={loading}
                        >
                          Skip
                        </button>
                        <button
                          className="btn btn-primary w-full sm:w-auto"
                          onClick={() => handleSubmit(false)}
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Next"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-sm text-center text-gray-600">
                      Add a payment method (optional)
                    </p>
                    <Elements stripe={stripePromise}>
                      <PaymentForm 
                        token={token || reduxToken} 
                        onSuccess={handlePaymentSuccess}
                        billingDetails={billingDetails}
                        email={email}
                        dispatch={dispatch}
                      />
                    </Elements>
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
                      <button className="btn btn-secondary w-full sm:w-auto" onClick={() => setStep(3)}>
                        Previous
                      </button>
                      <button className="btn btn-outline w-full sm:w-auto" onClick={() => setStep(5)}>
                        Skip
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-sm text-center text-gray-600">
                      A verification email has been sent to <strong>{email}</strong>. Please check your inbox (and spam/junk folder) to verify your email address.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        className="btn btn-outline w-full sm:w-auto"
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        Resend Verification Email
                      </button>
                    </div>
                    <div className="flex justify-center mt-6 sm:mt-8">
                      <button className="btn btn-secondary w-full sm:w-auto" onClick={() => setStep(4)}>
                        Previous
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SignupModal;