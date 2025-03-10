"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser, selectUserId, selectIsBillingDetailsAvailable } from "@/redux/authSlice";
import SearchParamsHandler from "./SearchParamsHandler";
import BillingDetailsForm from "./BillingDetailsForm";
import Link from "next/link";

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);
  const isBillingDetailsAvailable = useSelector(selectIsBillingDetailsAvailable);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const [productDetails, setProductDetails] = useState({
    productId: "",
    productName: "Product Name",
    productImage: null,
    offerPrice: "0.00",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billingDetails, setBillingDetails] = useState(null); // Updated billing details from form if edited

  useEffect(() => {
    const newProductDetails = {
      productId: searchParams.get("productId") || "",
      productName: searchParams.get("name") || "Product Name",
      productImage: searchParams.get("image") || null,
      offerPrice: searchParams.get("price") || "0.00",
    };
    setProductDetails(newProductDetails);
  }, [searchParams]);

  const handleBillingUpdate = (updatedBillingDetails) => {
    setBillingDetails(updatedBillingDetails); // Store updated billing details locally
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!productDetails.productId) {
      setError("Product ID is missing. Please select a product.");
      setLoading(false);
      return;
    }

    // Require billing details update only if not already available
    if (!isBillingDetailsAvailable && !billingDetails) {
      setError("Please update your billing address before submitting the offer.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create order in your backend
      const payload = {
        products: [
          {
            product: productDetails.productId,
            Remark: `make an offer of $${parseFloat(productDetails.offerPrice).toLocaleString()}`,
            Offer_Amount: parseFloat(productDetails.offerPrice) * 100,
          },
        ],
        totalAmount: parseFloat(productDetails.offerPrice) + 100,
      };

      const orderResponse = await fetch("https://bid.nyelizabeth.com/v1/api/order/MakeOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || "Failed to create order");

      const orderId = orderData.result._id;

      // Step 2: Create Stripe Checkout Session
      const stripeResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${productDetails.productName} - Auction Offer`,
                  images: productDetails.productImage ? [decodeURIComponent(productDetails.productImage)] : [],
                },
                unit_amount: Math.round((parseFloat(productDetails.offerPrice) + 100) * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${window.location.origin}/checkout`,
          metadata: {
            CustomerId: userId,
            integration_check: "auction_payment",
            productId: productDetails.productId,
            orderId: orderId,
          },
        }),
      });

      const stripeData = await stripeResponse.json();
      if (!stripeResponse.ok) throw new Error(stripeData.error || "Failed to create checkout session");

      const stripeSessionId = stripeData.id;

      // Step 3: Redirect to Stripe Checkout
      const stripe = await import("@stripe/stripe-js").then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      );
      await stripe.redirectToCheckout({ sessionId: stripeSessionId });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-[60px] bg-gray-50 py-10 flex justify-center items-center">
      <div className="max-w-7xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 -z-10"></div>

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Secure Checkout</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BillingDetailsForm user={user} token={token} onBillingUpdate={handleBillingUpdate} />
          </div>

          <div className="p-6 border rounded-2xl bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Offer</h2>
            {productDetails.productImage ? (
              <Image
                src={decodeURIComponent(productDetails.productImage)}
                alt={productDetails.productName}
                width={200}
                height={200}
                className="rounded-lg w-full object-cover mb-4 shadow-md"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg mb-4" />
            )}
            <p className="text-gray-700 font-medium">{productDetails.productName}</p>
            <div className="mt-4 text-gray-600 space-y-1">
              <p>
                Subtotal:{" "}
                <span className="font-bold text-lg">${parseFloat(productDetails.offerPrice).toLocaleString()}</span>
              </p>
              <p>
                Hold Amount (Non-refundable):{" "}
                <span className="font-bold text-green-500">+$100</span>
              </p>
              <p className="text-lg font-semibold">
                Total:{" "}
                <span className="font-bold text-green-600">
                  ${(parseFloat(productDetails.offerPrice) + 100).toLocaleString()}
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !userId || !token || !productDetails.productId}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg transition duration-300 mt-6 ${
                loading || !userId || !token || !productDetails.productId
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {loading ? "Processing..." : "Submit Offer"}
            </button>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            {!userId && (
              <p className="text-red-500 text-center mt-2">Please log in to submit an offer.</p>
            )}
            {!token && (
              <p className="text-red-500 text-center mt-2">Authentication token missing. Please log in again.</p>
            )}
            {!productDetails.productId && (
              <p className="text-red-500 text-center mt-2">Product ID is missing. Please select a product.</p>
            )}

            <p className="text-xs text-gray-500 text-center mt-3">
              By submitting an offer you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                terms and conditions
              </Link>
              .
            </p>
          </div>
        </form>

        <button
          onClick={() => router.back()}
          className="mt-6 text-blue-500 hover:text-blue-700 underline block text-center transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}