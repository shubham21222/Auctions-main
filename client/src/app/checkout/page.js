"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchParamsHandler from "./SearchParamsHandler";

export default function Checkout() {
  const router = useRouter();
  const [productDetails, setProductDetails] = useState({
    productName: "Product Name",
    productImage: null,
    offerPrice: "0.00",
  });

  return (
    <>
      {/* Handle Search Params with Suspense */}
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <SearchParamsHandler setProductDetails={setProductDetails} />
      </Suspense>

      <Header />
      <div className="min-h-screen mt-[60px] bg-gray-50 py-10 flex justify-center items-center">
        <div className="max-w-7xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          {/* Gradient Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 -z-10"></div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Secure Checkout</h1>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Billing Details Section */}
            <div className="lg:col-span-2 p-6 border rounded-2xl bg-gray-50 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Billing Details</h2>
              <form className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Company Name (Optional) */}
                <input
                  type="text"
                  placeholder="Company Name (Optional)"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Street Address */}
                <input
                  type="text"
                  placeholder="Street Address"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                {/* City & State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* ZIP Code & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Email Address */}
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                {/* Order Notes (Optional) */}
                <textarea
                  placeholder="Order Notes (Optional)"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </form>
            </div>

            {/* Offer Summary Section */}
            <div className="p-6 border rounded-2xl bg-gray-50 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Offer</h2>

              {/* Product Image */}
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

              {/* Product Name */}
              <p className="text-gray-700 font-medium">{productDetails.productName}</p>

              {/* Price Breakdown */}
              <div className="mt-4 text-gray-600 space-y-1">
                <p>
                  Subtotal:{" "}
                  <span className="font-bold text-lg">${parseFloat(productDetails.offerPrice).toLocaleString()}</span>
                </p>
                <p>
                  Hold Amount (Non-refundable):{" "}
                  <span className="font-bold text-red-500">-$100</span>
                </p>
                <p className="text-lg font-semibold">
                  Total:{" "}
                  <span className="font-bold text-green-600">
                    ${(parseFloat(productDetails.offerPrice) - 100).toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 mt-6">
                Submit Offer
              </button>

              {/* Terms and Conditions */}
              <p className="text-xs text-gray-500 text-center mt-3">
                By submitting an offer you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  terms and conditions
                </a>
                .
              </p>
            </div>
          </div>

          {/* Go Back Button */}
          <button
            onClick={() => router.back()}
            className="mt-6 text-blue-500 hover:text-blue-700 underline block text-center transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}