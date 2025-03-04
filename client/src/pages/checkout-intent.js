"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import config from "@/app/config_BASE_URL";
import "../app/globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ product, bidAmount, auctionId, clientSecret, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment service unavailable. Please try again.");
      return;
    }

    if (!firstName || !lastName || !addressLine1 || !city || !country || !phone) {
      toast.error("Please fill in all required fields.");
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

      toast.success("Billing address updated successfully!");

      const cardElement = elements.getElement(CardElement);
      console.log("Attempting to confirm PaymentIntent with clientSecret:", clientSecret);

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
        return_url: `${window.location.origin}/success?success=true&auctionId=${auctionId}&paymentIntentId=${clientSecret.split('_secret_')[0]}`,
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        toast.error(error.message || "Payment authorization failed.");
        setIsLoading(false);
        return;
      }

      console.log("PaymentIntent after confirmation:", paymentIntent);

      if (paymentIntent.status === "requires_capture") {
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

        router.push(`/success?success=true&auctionId=${auctionId}&paymentIntentId=${paymentIntent.id}`);
      } else {
        console.error("Unexpected PaymentIntent status:", paymentIntent.status);
        toast.error("Payment processing incomplete. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to complete payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-6 mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-luxury-charcoal mb-8">Checkout</h1>
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
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input
            placeholder="Street Address (Line 1)"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              placeholder="Country (e.g., IN)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              maxLength={2}
            />
          </div>
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
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
  const productId = searchParams.get("productId"); // "67bda0468eaddf8e51524cb9"
  const token = searchParams.get("token"); // Your JWT token

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered with:", { productId, token });

    const fetchProduct = async () => {
      console.log("fetchProduct started - productId:", productId, "token:", token);

      if (!productId || !token) {
        console.error("Missing productId or token at fetch time:", { productId, token });
        setError("Missing productId or token.");
        setLoading(false);
        return;
      }

      try {
        const url = `${config.baseURL}/v1/api/product/${productId}`;
        console.log("Fetching product with URL:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch product: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.status && data.items) {
          console.log("Setting product:", data.items);
          setProduct(data.items);
          setError(null); // Clear any previous errors
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
      } finally {
        console.log("Fetch complete - loading set to false");
        setLoading(false);
      }
    };

    // Only fetch if productId and token are present
    if (productId && token) {
      setError(null); // Clear any previous errors before fetching
      fetchProduct();
    } else {
      console.error("Skipping fetch due to missing productId or token:", { productId, token });
      setError("Missing productId or token.");
      setLoading(false);
    }
  }, [productId, token]);

  console.log("Render state:", { loading, error, product });

  if (!clientSecret || !bidAmount || !auctionId || !productId || !token) {
    console.error("Invalid checkout parameters:", { clientSecret, bidAmount, auctionId, productId, token });
    return <div className="text-center py-12">Invalid checkout parameters.</div>;
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Unable to load product details.</div>;
  }

  return (
    <>
      <Elements stripe={stripePromise}>
        <Header />
        <CheckoutForm
          product={product}
          bidAmount={bidAmount}
          auctionId={auctionId}
          clientSecret={clientSecret}
          token={token}
        />
        <Footer />
      </Elements>
    </>
  );
}