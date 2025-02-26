"use client";
import { Dialog } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MakeOfferModal({ isOpen, onClose, minPrice, product, productId }) {
  const [offerAmount, setOfferAmount] = useState("");
  const [message, setMessage] = useState(""); // State for optional message
  const [error, setError] = useState("");

  console.log("MakeOfferModal productId:", productId); // Debug productId

  const handleSubmit = () => {
    const offerValue = parseFloat(offerAmount);
    if (isNaN(offerValue) || offerValue < minPrice) {
      setError(`Offer must be at least $${minPrice.toLocaleString()}`);
      return;
    }
    setError("");
    console.log("Offer Submitted:", { offerValue, message: message || "No message provided" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Make an Offer
          </Dialog.Title>
          <p className="text-sm text-gray-500 mt-1">
            Minimum offer accepted price: <span className="font-bold">${minPrice.toLocaleString()}</span>
          </p>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Offer Amount ($)</label>
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded-md"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              min={minPrice}
              required // Keep this required since offer amount is mandatory
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
            <Link
              href={{
                pathname: "/checkout",
                query: {
                  productId: productId || "",
                  name: product?.name || "",
                  image: product?.images?.[0] || "",
                  price: offerAmount || "",
                  message: message || "", // Pass message if provided, empty string if not
                },
              }}
            >
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-900 text-white"
              >
                Continue
              </Button>
            </Link>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}