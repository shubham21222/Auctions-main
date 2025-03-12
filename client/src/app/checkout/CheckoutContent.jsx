"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectUserId, setPaymentDetails } from "@/redux/authSlice";
import BillingDetailsForm from "./BillingDetailsForm";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ productDetails, userId, token, billingDetails, orderId, paymentIntentClientSecret, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCardChange = (event) => {
    setIsCardComplete(event.complete);
  };

  const handleProceed = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !isCardComplete) return;

    setProcessing(true);
    onError(null);

    try {
      // Normalize billing_details for Stripe, omitting empty fields
      const stripeBillingDetails = billingDetails
        ? {
            name: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
            email: billingDetails.email || undefined,
            phone: billingDetails.phone || undefined,
            address: {},
          }
        : undefined;

      // Dynamically add address fields only if they have values
      if (billingDetails.address) stripeBillingDetails.address.line1 = billingDetails.address;
      if (billingDetails.city) stripeBillingDetails.address.city = billingDetails.city;
      if (billingDetails.state) stripeBillingDetails.address.state = billingDetails.state;
      if (billingDetails.zipCode) stripeBillingDetails.address.postal_code = billingDetails.zipCode;
      if (billingDetails.country) stripeBillingDetails.address.country = billingDetails.country;

      // If address is empty, remove it entirely
      if (Object.keys(stripeBillingDetails.address).length === 0) {
        delete stripeBillingDetails.address;
      }

      console.log("Stripe Billing Details:", stripeBillingDetails);

      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentClientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: stripeBillingDetails,
        },
      });

      if (error) throw new Error(error.message);

      const paymentIntentId = paymentIntent.id;

      console.log("Authorized Payment Intent:", { productId: productDetails.productId, paymentIntentId, orderId, amount: productDetails.offerPrice * 100 });
      dispatch(
        setPaymentDetails({
          productId: productDetails.productId,
          paymentIntentId,
          orderId,
          amount: productDetails.offerPrice * 100,
        })
      );

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
                unit_amount: 100 * 100,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${window.location.origin}/checkout`,
          metadata: {
            CustomerId: userId,
            integration_check: "auction_fee_payment",
            productId: productDetails.productId,
            orderId,
            remainingPaymentIntentId: paymentIntentId,
          },
        }),
      });

      const stripeData = await stripeResponse.json();
      if (!stripeResponse.ok) throw new Error(stripeData.error || "Failed to create checkout session");

      const stripeInstance = await stripePromise;
      await stripeInstance.redirectToCheckout({ sessionId: stripeData.id });
    } catch (err) {
      onError(err.message);
      console.error("Error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleProceed}>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Enter Card Details</label>
        <CardElement
          options={{ style: { base: { fontSize: "16px" } } }}
          onChange={handleCardChange}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || !isCardComplete || processing}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg transition duration-300 ${processing || !isCardComplete || !stripe ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"}`}
      >
        {processing ? "Processing..." : "Proceed"}
      </button>
    </form>
  );
};

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useSelector(selectUserId);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const dispatch = useDispatch();

  const [productDetails, setProductDetails] = useState({
    productId: "",
    productName: "Product Name",
    productImage: null,
    offerPrice: "0.00",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingDetails, setBillingDetails] = useState(null);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [apiBillingDetails, setApiBillingDetails] = useState(null);

  useEffect(() => {
    const newProductDetails = {
      productId: searchParams.get("productId") || "",
      productName: searchParams.get("name") || "Product Name",
      productImage: searchParams.get("image") || null,
      offerPrice: searchParams.get("price") || "0.00",
    };
    setProductDetails(newProductDetails);

    const initializeCheckout = async () => {
      if (!newProductDetails.productId || !token || !userId) return;

      try {
        const billingResponse = await fetch(`https://bid.nyelizabeth.com/v1/api/auth/getUserByBillingAddress/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
        });
        const billingData = await billingResponse.json();
        if (!billingResponse.ok) throw new Error(billingData.message || "Failed to fetch billing details");

        const fetchedBillingDetails = billingData.items.BillingDetails;
        console.log("API Response:", billingData);
        console.log("Fetched Billing Details:", fetchedBillingDetails);
        setApiBillingDetails(fetchedBillingDetails);

        const hasBillingDetails = fetchedBillingDetails.length > 0 && fetchedBillingDetails[0] && Object.keys(fetchedBillingDetails[0]).length > 0;
        setBillingDetails(hasBillingDetails ? fetchedBillingDetails[0] : null);
        console.log("Has Billing Details:", hasBillingDetails);
        console.log("Initial billingDetails:", hasBillingDetails ? fetchedBillingDetails[0] : null);

        const totalAmount = parseFloat(newProductDetails.offerPrice) + 100;
        const holdAmount = parseFloat(newProductDetails.offerPrice);

        const orderResponse = await fetch("https://bid.nyelizabeth.com/v1/api/order/MakeOrder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
          body: JSON.stringify({
            products: [
              {
                product: newProductDetails.productId,
                Remark: `make an offer of $${newProductDetails.offerPrice} with $100 auction fee`,
                Offer_Amount: newProductDetails.offerPrice * 100,
              },
            ],
            totalAmount,
          }),
        });
        const orderData = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(orderData.message || "Failed to create order");
        setOrderId(orderData.result._id);

        const paymentIntentResponse = await fetch("/api/create-payment-intent2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: holdAmount * 100,
            currency: "usd",
            capture_method: "manual",
            metadata: { CustomerId: userId, productId: newProductDetails.productId, orderId: orderData.result._id },
          }),
        });
        const paymentIntentData = await paymentIntentResponse.json();
        if (!paymentIntentResponse.ok) throw new Error(paymentIntentData.error || "Failed to create Payment Intent");
        setPaymentIntentClientSecret(paymentIntentData.client_secret);
      } catch (err) {
        setError(err.message);
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [searchParams, token, userId]);

  const handleBillingUpdate = (updatedBillingDetails) => {
    setBillingDetails(updatedBillingDetails);
    setApiBillingDetails([updatedBillingDetails]);
  };

  const areBillingDetailsComplete = () => {
    if (!billingDetails) return false;
    const requiredFields = ["firstName", "lastName", "address", "city", "state", "zipCode", "country", "email", "phone"];
    return requiredFields.every((field) => billingDetails[field] && billingDetails[field].trim() !== "");
  };

  const isSubmitDisabled = !userId || !token || !productDetails.productId || !areBillingDetailsComplete();

  if (loading) {
    return (
      <div className="min-h-screen mt-[60px] bg-gray-50 py-10 flex justify-center items-center">
        <div className="max-w-7xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering - billingDetails:", billingDetails, "apiBillingDetails:", apiBillingDetails);

  return (
    <div className="min-h-screen mt-[60px] bg-gray-50 py-10 flex justify-center items-center">
      <div className="max-w-7xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 -z-10"></div>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {apiBillingDetails === null || apiBillingDetails.length === 0 ? (
              <BillingDetailsForm token={token} onBillingUpdate={handleBillingUpdate} />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Billing Details</h3>
                <p>First Name: {billingDetails?.firstName || ""}</p>
                <p>Last Name: {billingDetails?.lastName || ""}</p>
                <p>Street Address: {billingDetails?.address || ""}</p>
                <p>City: {billingDetails?.city || ""}</p>
                <p>State: {billingDetails?.state || ""}</p>
                <p>ZIP Code: {billingDetails?.zipCode || ""}</p>
                <p>Country: {billingDetails?.country || ""}</p>
                <p>Phone: {billingDetails?.phone || ""}</p>
                <p>Email: {billingDetails?.email || ""}</p>
                <button
                  onClick={() => setApiBillingDetails([])}
                  className="mt-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Edit Billing Details
                </button>
              </div>
            )}
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
              <p>Product Price (On Hold): <span className="font-bold text-lg">${parseFloat(productDetails.offerPrice).toLocaleString()}</span></p>
              <p>Auction Fee (Charged): <span className="font-bold text-red-500">+$100</span></p>
              <p className="text-lg font-semibold">Total Authorized: <span className="font-bold text-green-600">${(parseFloat(productDetails.offerPrice) + 100).toLocaleString()}</span></p>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm
                productDetails={productDetails}
                userId={userId}
                token={token}
                billingDetails={billingDetails}
                orderId={orderId}
                paymentIntentClientSecret={paymentIntentClientSecret}
                onError={setError}
              />
            </Elements>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            {isSubmitDisabled && <p className="text-red-500 text-center mt-2">Please complete all required fields.</p>}
            <p className="text-xs text-gray-500 text-center mt-3">
              By submitting, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">terms and conditions</Link>.
            </p>
          </div>
        </div>

        <button onClick={() => router.back()} className="mt-6 text-blue-500 hover:text-blue-700 underline block text-center transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );
}