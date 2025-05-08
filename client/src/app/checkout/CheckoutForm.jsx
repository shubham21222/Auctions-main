"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setPaymentDetails } from "@/redux/authSlice";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ productDetails, userId, token, billingDetails, orderId, onError }) => {
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);

  const handleProceed = async (e) => {
    e.preventDefault();
    if (!orderId || !userId || !token) return;

    setProcessing(true);
    onError(null);

    try {
      // Normalize billing_details for Stripe
      const stripeBillingDetails = billingDetails
        ? {
            name: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
            email: billingDetails.email || undefined,
            phone: billingDetails.phone || undefined,
            address: {},
          }
        : undefined;

      if (billingDetails.address) stripeBillingDetails.address.line1 = billingDetails.address;
      if (billingDetails.city) stripeBillingDetails.address.city = billingDetails.city;
      if (billingDetails.state) stripeBillingDetails.address.state = billingDetails.state;
      if (billingDetails.zipCode) stripeBillingDetails.address.postal_code = billingDetails.zipCode;
      if (billingDetails.country) stripeBillingDetails.address.country = billingDetails.country;

      if (Object.keys(stripeBillingDetails.address).length === 0) {
        delete stripeBillingDetails.address;
      }

      // Create Stripe Checkout session for $100 auction fee
      const stripeResponse = await fetch("/api/create-checkout-session2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${productDetails.productName} - Auction Fee`,
                  images: productDetails.productImage ? [decodeURIComponent(productDetails.productImage)] : [],
                },
                unit_amount: 100 * 100, // $100 in cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          payment_method_types: ["card"],
          billing_address_collection: "required",
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${window.location.origin}/checkout`,
          metadata: {
            CustomerId: userId,
            integration_check: "auction_fee_payment",
            productId: productDetails.productId,
            orderId,
          },
          customer_email: billingDetails.email || undefined,
        }),
      });

      const stripeData = await stripeResponse.json();
      if (!stripeResponse.ok) throw new Error(stripeData.error || "Failed to create checkout session");

      // Store payment details in Redux
      dispatch(
        setPaymentDetails({
          productId: productDetails.productId,
          paymentIntentId: stripeData.id, // Use session ID as a reference
          orderId,
          amount: 100 * 100, // $100 in cents
        })
      );

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: stripeData.id });
      if (error) throw new Error(error.message);
    } catch (err) {
      onError(err.message);
      console.error("Error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">
          <strong>Note:</strong> $100 will be refunded if we are not able to process the order
        </p>
      </div>
      <button
        onClick={handleProceed}
        disabled={processing}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg transition duration-300 ${processing ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"}`}
      >
        {processing ? "Processing..." : "Pay $100 Auction Fee"}
      </button>
    </div>
  );
};

export default CheckoutForm;