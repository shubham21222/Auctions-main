// app/success/page.js
import { Suspense } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuccessContent from "./SuccessContent"; // New Client Component

export default function SuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading success page...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}