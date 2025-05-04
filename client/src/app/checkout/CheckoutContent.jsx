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
import config from "@/app/config_BASE_URL";
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
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">
          <strong>Note:</strong> $100 will be refunded if we are not able to process the order
        </p>
      </div>
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
        const billingResponse = await fetch(`${config.baseURL}/v1/api/auth/getUserByBillingAddress/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
        });
        const billingData = await billingResponse.json();
        if (!billingResponse.ok) throw new Error(billingData.message || "Failed to fetch billing details");

        if (billingData.status && billingData.items?.BillingDetails?.length > 0) {
          const fetchedBillingDetails = billingData.items.BillingDetails[0];
          
          // Map API fields to our component's field names
          const mappedBillingDetails = {
            firstName: fetchedBillingDetails.firstName || "",
            lastName: fetchedBillingDetails.lastName || "",
            companyName: fetchedBillingDetails.company_name || "",
            address: fetchedBillingDetails.streetAddress || "",
            city: fetchedBillingDetails.city || "",
            state: fetchedBillingDetails.state || "",
            zipCode: fetchedBillingDetails.zipcode || "",
            phone: fetchedBillingDetails.phone || "",
            email: fetchedBillingDetails.email || "",
            country: fetchedBillingDetails.country || "",
            orderNotes: fetchedBillingDetails.orderNotes || "",
          };

          setBillingDetails(mappedBillingDetails);
          setApiBillingDetails([mappedBillingDetails]);
        } else {
          setBillingDetails(null);
          setApiBillingDetails([]);
        }

        const totalAmount = parseFloat(newProductDetails.offerPrice) + 100;
        const holdAmount = parseFloat(newProductDetails.offerPrice);

        const orderResponse = await fetch(`${config.baseURL}/v1/api/order/MakeOrder`, {
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
      <div className="min-h-screen mt-[60px] bg-gradient-to-b from-gray-50 to-white py-10 flex justify-center items-center">
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
    <div className="min-h-screen mt-[60px] bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 -z-10"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Secure Checkout</h1>
            <p className="text-center text-gray-600 mb-8">Complete your purchase with confidence</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {apiBillingDetails === null || apiBillingDetails.length === 0 ? (
                  <BillingDetailsForm token={token} onBillingUpdate={handleBillingUpdate} />
                ) : (
                  <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Billing Details</h3>
                      <button
                        onClick={() => setApiBillingDetails([])}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Details
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{`${billingDetails?.firstName || ""} ${billingDetails?.lastName || ""}`}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Company Name</p>
                        <p className="font-medium">{billingDetails?.companyName || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{billingDetails?.email || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{billingDetails?.phone || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{billingDetails?.address || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium">{billingDetails?.city || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">State</p>
                        <p className="font-medium">{billingDetails?.state || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">ZIP Code</p>
                        <p className="font-medium">{billingDetails?.zipCode || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="font-medium">{billingDetails?.country || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Order Notes</p>
                        <p className="font-medium">{billingDetails?.orderNotes || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="p-6 border rounded-xl bg-white shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Summary</h2>
                    {productDetails.productImage ? (
                      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={decodeURIComponent(productDetails.productImage)}
                          alt={productDetails.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg mb-4" />
                    )}
                    <p className="text-gray-700 font-medium mb-4">{productDetails.productName}</p>
                    
                    <div className="space-y-3 py-4 border-t border-b">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Product Price (On Hold)</span>
                        <span className="font-semibold">${parseFloat(productDetails.offerPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Auction Fee</span>
                        <span className="font-semibold text-red-500">+$100</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-lg font-semibold">Total Authorized</span>
                        <span className="text-lg font-bold text-green-600">${(parseFloat(productDetails.offerPrice) + 100).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6">
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
                    </div>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    
                    {isSubmitDisabled && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-600 text-sm">Please complete all required fields to proceed.</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By submitting, you agree to our{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        terms and conditions
                      </Link>
                    </p>
                  </div>

                  <button 
                    onClick={() => router.back()} 
                    className="mt-4 w-full text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}