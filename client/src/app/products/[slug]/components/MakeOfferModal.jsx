'use client';
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MakeOfferModal({ isOpen, onClose, minPrice, product }) {
  const [offerAmount, setOfferAmount] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const offerValue = parseFloat(offerAmount);
    if (isNaN(offerValue) || offerValue < minPrice) {
      setError(`Offer must be at least $${minPrice.toLocaleString()}`);
      return;
    }
    setError("");
    // Handle offer submission (API call, etc.)
    console.log("Offer Submitted:", offerValue);
    onClose(); // Close modal after successful submission
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Include a Message</label>
              <textarea className="w-full mt-1 p-2 border rounded-md" rows={3}></textarea>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose} className="bg-gray-200 text-gray-700">Cancel</Button>
              <Link 
                href={{
                  pathname: "/checkout",
                  query: {
                    name: product?.name,
                    image: product?.images?.[0],
                    price: offerAmount
                  }
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
    </Transition>
  );
}