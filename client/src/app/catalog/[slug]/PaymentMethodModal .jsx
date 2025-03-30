"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import config from "@/app/config_BASE_URL";

// Ensure this is your correct Stripe test public key
const stripePromise = loadStripe('pk_test_51QvrYjAyvNAmOwKWxkE96ErZaYGx3LcIivgG0OUWeUowZUupEuM7ir6fLdxhtssPtNQnruXmKMfjB9CDbA8KjG1u00thCR8WnJ');

const PaymentForm = ({ onSuccess, onClose, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug Stripe loading and CardElement mounting
  useEffect(() => {
    console.log("Stripe instance:", stripe ? "Loaded" : "Not loaded");
    console.log("Elements instance:", elements ? "Loaded" : "Not loaded");
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please wait or refresh the page.");
      console.error("Stripe or Elements not available");
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card input field failed to load.");
      console.error("CardElement not found");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to create payment method...");
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: cardholderName },
      });

      if (stripeError) {
        console.error("Stripe error:", stripeError);
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      console.log("Payment method created:", paymentMethod.id);
      const response = await fetch(`${config.baseURL}/v1/api/auth/add-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to add payment method");
      }

      toast.success("Payment method added successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="cardholderName" className="text-gray-700 font-medium">
          Name on Card
        </Label>
        <Input
          id="cardholderName"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-gray-700 font-medium">Card Details</Label>
        <div
          className="border border-gray-300 rounded-lg p-3 mt-1 bg-white min-h-[40px]"
          style={{ minHeight: "40px" }} // Ensure visibility
        >
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
            onReady={(el) => console.log("CardElement mounted:", el)}
            onChange={(e) => {
              console.log("CardElement input changed:", e);
              if (e.error) setError(e.error.message);
              else setError(null);
            }}
            onFocus={() => console.log("CardElement focused")}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          onClick={onClose}
          variant="outline"
          disabled={loading}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Add Card"}
        </Button>
      </div>
    </form>
  );
};

export default function PaymentMethodModal({ isOpen, onClose, onSuccess, token }) {
  useEffect(() => {
    console.log("PaymentMethodModal opened:", isOpen);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-gray-100 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            Add Payment Method
          </DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm onSuccess={onSuccess} onClose={onClose} token={token} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}