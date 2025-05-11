"use client";
import { Dialog } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import useRouter

export default function MakeOfferModal({ isOpen, onClose, minPrice, product, productId }) {
  const [offerAmount, setOfferAmount] = useState("");
  const [message, setMessage] = useState(""); // State for optional message
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for button
  const router = useRouter(); // For programmatic navigation

  console.log("MakeOfferModal productId:", productId);

  const handleSubmit = () => {
    const offerValue = parseFloat(offerAmount);
    if (isNaN(offerValue)) {
      setError("Please enter a valid offer amount");
      return;
    }
    if (offerValue < minPrice) {
      setError(`Your offer must be at least $${minPrice.toLocaleString()}`);
      return;
    }
    setError("");
    setIsLoading(true);

    // Construct the checkout URL
    const queryParams = new URLSearchParams({
      productId: productId || "",
      name: product?.name || "",
      image: product?.images?.[0] || "",
      price: offerAmount || "",
      message: message || "",
      reservePrice: minPrice || "",
    }).toString();

    // Navigate to checkout page
    router.push(`/checkout?${queryParams}`).then(() => {
      setIsLoading(false);
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Make an Offer
          </Dialog.Title>
          <p className="text-sm text-gray-500 mt-1">
            Minimum Price Limit: <span className="font-bold">${minPrice.toLocaleString()}</span>
          </p>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Your Offer Amount ($)</label>
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded-md"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              min={minPrice}
              placeholder={`Enter amount (min: $${minPrice.toLocaleString()})`}
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Include a Message (Optional)</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add an optional message..."
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={onClose} className="bg-gray-200 text-gray-700">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-900 text-white flex items-center justify-center"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}