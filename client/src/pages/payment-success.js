import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Clock, Truck } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b  from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto mt-6 px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Thank You for Your Payment!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-12"
          >
            Your order has been successfully processed. We'll review it and prepare your items for shipping.
          </motion.p>

          {/* Order Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Confirmed</h3>
                <p className="text-sm text-gray-600">Your order has been received</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Processing</h3>
                <p className="text-sm text-gray-600">We're preparing your order</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
                <p className="text-sm text-gray-600">Your order will be shipped soon</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="btn btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Continue Shopping
            </Link>
            {/* <Link
              href="/profile"
              className="btn btn-outline border-2 hover:bg-gray-50 transition-all"
            >
              View Order Status
            </Link> */}
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 bg-gray-50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order, please don't hesitate to contact our support team.
            </p>
            <Link
              href="/contact-us"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact Support →
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess; 