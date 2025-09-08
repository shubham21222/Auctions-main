// pages/checkout.js

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectBillingDetails, selectIsBillingDetailsAvailable } from "@/redux/authSlice";
import config from "@/app/config_BASE_URL";
import "../app/globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useSocket } from "@/hooks/useSocket";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Notification Display Component
const Notification = ({ type, message }) => {
  // Define color schemes with gradients and hover effects
  const bgColor = {
    success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    error: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
    info: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
  }[type] || "bg-gradient-to-r from-gray-500 to-gray-600"; // Fallback for unknown types

  return (
    <div
      className={`
        ${bgColor} 
        text-white 
        p-3 
        rounded-lg 
        mb-3 
        shadow-xl 
        border border-opacity-20 border-white/20 
        transform 
        transition-all 
        duration-300 
        animate-slide-in 
        hover:shadow-2xl 
        flex 
        items-center 
        justify-between 
        max-w-sm
      `}
    >
      <span className="font-medium text-sm tracking-wide">{message}</span>
      <button
        className="ml-2 text-white/80 hover:text-white focus:outline-none"
        onClick={(e) => {
          e.target.parentElement.classList.add("animate-slide-out");
          setTimeout(() => e.target.parentElement.remove(), 300);
        }}
      >
        ✕
      </button>
    </div>
  );
};
const CheckoutForm = ({
  product,
  bidAmount,
  auctionId,
  clientSecret,
  token,
  auctionType,
  setNotifications, // Receive setNotifications as a prop
  notifications // Receive notifications as a prop
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { socket, joinAuction, placeBid, notifications: socketNotifications } = useSocket();

  const billingDetailsFromRedux = useSelector(selectBillingDetails)[0] || {};
  const isBillingDetailsAvailable = useSelector(selectIsBillingDetailsAvailable);
  const userId = useSelector((state) => state.auth._id);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Custom notification handler using the passed setNotifications
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    if (isBillingDetailsAvailable && billingDetailsFromRedux) {
      setFirstName(billingDetailsFromRedux.firstName || "");
      setLastName(billingDetailsFromRedux.lastName || "");
      setAddressLine1(billingDetailsFromRedux.streetAddress || "");
      setCity(billingDetailsFromRedux.city || "");
      setCountry(billingDetailsFromRedux.state || "");
      setPhone(billingDetailsFromRedux.phone || "");
    }
  }, [isBillingDetailsAvailable, billingDetailsFromRedux]);

  useEffect(() => {
    if (auctionType === "LIVE" && socket) {
      joinAuction(auctionId);
      addNotification("success", `You joined auction ${auctionId}`);
    }
  }, [socket, auctionId, auctionType, joinAuction]);

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      addNotification("error", "Payment service unavailable. Please try again.");
      return;
    }

    if (!firstName || !lastName || !addressLine1 || !city || !country || !phone) {
      addNotification("error", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const billingPayload = {
        BillingDetails: [
          {
            firstName,
            lastName,
            company_name: "N/A",
            streetAddress: addressLine1,
            city,
            state: country,
            zipcode: "N/A",
            phone,
            email: "user@example.com",
            orderNotes: "N/A",
          },
        ],
      };

      const billingResponse = await fetch(`${config.baseURL}/v1/api/auth/UpdateBillingAddress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(billingPayload),
      });

      if (!billingResponse.ok) {
        const errorData = await billingResponse.json();
        throw new Error(errorData.message || "Failed to update billing address");
      }

      addNotification("success", "Billing address updated successfully!");

      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`,
            address: {
              line1: addressLine1,
              city: city,
              country: country,
            },
            phone: phone,
          },
        },
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        addNotification("error", error.message || "Payment authorization failed.");
        return;
      }

      if (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded") {
        if (auctionType === "LIVE" && socket) {
          placeBid(auctionId, parseFloat(bidAmount));
        } else {
          const bidResponse = await fetch(`${config.baseURL}/v1/api/auction/placeBid`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              auctionId: auctionId,
              bidAmount: parseFloat(bidAmount),
              paymentIntentId: paymentIntent.id,
            }),
          });

          if (!bidResponse.ok) {
            const errorData = await bidResponse.json();
            throw new Error(errorData.message || "Failed to place bid");
          }
        }

        addNotification("success", "Bid placed successfully!");
        router.push(`/success?success=true&auctionId=${auctionId}&paymentIntentId=${paymentIntent.id}`);
      } else {
        console.error("Unexpected PaymentIntent status:", paymentIntent.status);
        addNotification("error", "Payment processing incomplete. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      addNotification("error", error.message || "Failed to complete payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-6 mx-auto px-4 py-12 relative">
      <h1 className="text-3xl font-bold text-luxury-charcoal mb-8">Checkout</h1>
      {/* Notification Display */}
      <div className="fixed top-20 right-4 z-50 w-80">
        {[...socketNotifications, ...notifications].map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
          />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Item Details</h2>
          <div className="relative w-32 h-32 mb-4">
            <Image
              src={product?.image?.[0] || "/placeholder.svg"}
              alt={product?.title || "Item"}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <p className="text-gray-600">
            <strong>Item:</strong> {product?.title || "Unknown"}
          </p>
          <p className="text-gray-600">
            <strong>Bid Price:</strong> ${parseFloat(bidAmount).toLocaleString()}
          </p>
        </div>

        <form onSubmit={handlePayment} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Input
            placeholder="Street Address (Line 1)"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              placeholder="Country (e.g., IN)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              maxLength={2}
              disabled={isLoading}
            />
          </div>
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="border p-2 rounded">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": { color: "#aab7c4" },
                  },
                  invalid: { color: "#9e2146" },
                },
              }}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-luxury-gold text-black hover:bg-luxury-gold/80"
            disabled={isLoading || !stripe || !elements}
          >
            {isLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default function Checkout() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("clientSecret");
  const bidAmount = searchParams.get("bidAmount");
  const auctionId = searchParams.get("auctionId");
  const productId = searchParams.get("productId");
  const token = useSelector((state) => state.auth.token);
  const auctionType = searchParams.get("auctionType");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]); // Local state for Checkout-specific notifications

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) {
        setError("Missing productId or token.");
        setLoading(false);
        setNotifications((prev) => [...prev, { id: Date.now(), type: "error", message: "Missing productId or token." }]);
        return;
      }

      try {
        const response = await fetch(`${config.baseURL}/v1/api/product/${productId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch product: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (data.status && data.items) {
          setProduct(data.items);
          setError(null);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
        setNotifications((prev) => [...prev, { id: Date.now(), type: "error", message: error.message }]);
      } finally {
        setLoading(false);
      }
    };

    if (productId && token) {
      fetchProduct();
    } else {
      // setError("Missing productId or token.");
      setLoading(false);
    }
  }, [productId, token]);

  // if (!clientSecret || !bidAmount || !auctionId || !productId || !token) {
  //   return (
  //     <div className="text-center py-12">
  //       <p className="text-red-500">Invalid checkout parameters. Please try again.</p>
  //     </div>
  //   );
  // }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // if (error) {
  //   return (
  //     <div className="text-center py-12">
  //       <p className="text-red-500">Error: {error}</p>
  //     </div>
  //   );
  // }

  // if (!product) {
  //   return (
  //     <div className="text-center py-12">
  //       <p className="text-red-500">Product not found.</p>
  //     </div>
  //   );
  // }

  return (
    <Elements stripe={stripePromise}>
      <Header />
      <CheckoutForm
        product={product}
        bidAmount={bidAmount}
        auctionId={auctionId}
        clientSecret={clientSecret}
        token={token}
        auctionType={auctionType}
        setNotifications={setNotifications} // Pass setter to CheckoutForm
        notifications={notifications} // Pass notifications state to CheckoutForm
      />
      <Footer />
    </Elements>
  );
}

// Force server-side rendering to prevent Redux prerendering errors
export async function getServerSideProps() {
  return { props: {} };
}