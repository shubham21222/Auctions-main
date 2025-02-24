// app/checkout/page.js
import { Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CheckoutContent from "./CheckoutContent"; // New Client Component

export default function Checkout() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}