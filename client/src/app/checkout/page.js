// app/checkout/page.js
import { Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CheckoutContent from "./CheckoutContent"; // New Client Component

export default function Checkout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600 text-lg font-medium">Loading checkout...</div>
              <div className="text-gray-400 text-sm mt-2">Please wait while we prepare your secure checkout</div>
            </div>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}