"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { updateBillingDetails, updatePaymentMethod } from "@/redux/authSlice";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import config from "../config_BASE_URL";

const stripePromise = loadStripe('pk_test_51PAs60SB7WwtOtybIdvkn8Cre8ZL9v5RJc61u8kzkKYZEsQbsMK6hLTZGIRoF0VKePdCk4iHQzh3Rxrd4sqaN1xM00NO4Zh4S6');

const PaymentForm = ({ token, onSuccess, billingDetails, email }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
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
          phone: billingDetails.phone,
          address: {
            line1: billingDetails.streetAddress,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.zipcode,
            country: 'US'
          }
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Save payment method to backend using the correct API endpoint
      const response = await fetch(`${config.baseURL}/v1/api/auth/add-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          billingDetails: billingDetails
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment method');
      }

      const data = await response.json();
      if (data.status) {
        // Update payment method in Redux store
        dispatch(updatePaymentMethod(paymentMethod.id));
        toast.success(data.message || "Card added successfully!");
        onSuccess();
      } else {
        throw new Error(data.message || 'Failed to save payment method');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Cardholder Name</span>
        </label>
        <input
          type="text"
          placeholder="Enter cardholder name"
          className="input input-bordered w-full"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">
          <span className="label-text">Card Details</span>
        </label>
        <CardElement
          className="p-3 border rounded-lg"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
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

const BillingPaymentModal = ({ isOpen, onClose, onSuccess, token, email }) => {
  const [step, setStep] = useState(1);
  const [billingDetails, setBillingDetails] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isPaymentMethodAdded = useSelector((state) => state.auth.isPaymentMethodAdded);

  useEffect(() => {
    if (isOpen && user?.BillingDetails?.length > 0) {
      // User has billing details, skip to payment step
      setBillingDetails(user.BillingDetails[0]);
      setStep(2);
    }
  }, [isOpen, user]);

  // Don't show modal if payment method is already added
  if (!isOpen || isPaymentMethodAdded) return null;

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBillingSubmit = async () => {
    try {
      // Save billing details to backend using the correct API endpoint
      const response = await fetch(`${config.baseURL}/v1/api/auth/UpdateBillingAddress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          BillingDetails: [billingDetails]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save billing details');
      }

      const data = await response.json();
      if (data.success) {
        // Update billing details in Redux store
        dispatch(updateBillingDetails(billingDetails));
        setStep(2);
      } else {
        throw new Error(data.message || 'Failed to save billing details');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative z-50 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>

            <div className="flex justify-center mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900">
                {step === 1 ? "Add Billing Details" : "Add Payment Method"}
              </h2>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">First Name</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      className="input input-bordered w-full"
                      value={billingDetails?.firstName || ""}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Last Name</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      className="input input-bordered w-full"
                      value={billingDetails?.lastName || ""}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Company Name</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Company Name"
                    className="input input-bordered w-full"
                    value={billingDetails?.company_name || ""}
                    onChange={handleBillingChange}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Street Address</span>
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    placeholder="Street Address"
                    className="input input-bordered w-full"
                    value={billingDetails?.streetAddress || ""}
                    onChange={handleBillingChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">City</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      className="input input-bordered w-full"
                      value={billingDetails?.city || ""}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">State</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      className="input input-bordered w-full"
                      value={billingDetails?.state || ""}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">ZIP Code</span>
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      placeholder="ZIP Code"
                      className="input input-bordered w-full"
                      value={billingDetails?.zipcode || ""}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Phone</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      className="input input-bordered w-full"
                      value={billingDetails?.phone || ""}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                </div>
                <button
                  onClick={handleBillingSubmit}
                  className="btn btn-primary w-full"
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  token={token}
                  onSuccess={() => {
                    onSuccess();
                    onClose();
                  }}
                  billingDetails={billingDetails}
                  email={email}
                />
              </Elements>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BillingPaymentModal; 