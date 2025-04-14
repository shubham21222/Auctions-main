"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditProfileModal from "./components/EditProfileModal";
import BillingDetailsModal from "./components/BillingDetailsModal";
import config from "../config_BASE_URL";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const tabs = ["Profile", "Saved Lots", "Bids", "Purchases", "Seller Portal", "Address"];
  const auth = useSelector((state) => state.auth);

  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${config.baseURL}/v1/api/auth/updateProfile`, {
          headers: {
            Authorization: `${auth.token}`,
          },
        });
        // Note: Dispatching setEmail is missing here; add if needed
        // if (response.data.items && response.data.items.email) {
        //   dispatch(setEmail(response.data.items.email));
        // }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [auth.token]);

  useEffect(() => {
    if (activeTab === "Saved Lots") {
      fetchWishlist();
    }
  }, [activeTab, auth.token]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/v1/api/favorite/all`, {
        headers: {
          Authorization: `${auth.token}`,
        },
      });

      // Filter out items where product is null
      const validWishlistItems = response.data.items
        .filter((item) => item.product !== null)
        .map((item) => item.product);
      setWishlistProducts(validWishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mt-[80px] mx-auto p-4 md:p-6">
        <div className="bg-gray-100 p-3 md:p-4 rounded-lg text-center">
          <h1 className="text-xl md:text-2xl font-semibold">My account</h1>
          <p className="text-base md:text-lg font-medium mt-2">
            {auth.items.email ? auth.items.email.split("@")[0] : "Loading..."}
          </p>
          <p className="text-blue-600 text-sm md:text-base">{auth.items.email || "Loading..."}</p>
        </div>

        <div className="flex border-b mt-4 md:mt-6 space-x-2 md:space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-2 whitespace-nowrap px-2 md:px-4 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "Profile" && (
          <Card className="mt-4 md:mt-6">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Profile Details</h2>
              <div className="bg-gray-100 p-3 md:p-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm font-medium">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Mobile Number</span>
                  <span>Password</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-700">
                  <span>{auth.items.email ? auth.items.email.split("@")[0] : "Loading..."}</span>
                  <span>{auth.items.email || "Loading..."}</span>
                  <span>{auth.billingDetails?.phone || "-"}</span>
                  <span>••••••••••</span>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <EditProfileModal />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Lots Tab */}
        {activeTab === "Saved Lots" && (
          <Card className="mt-4 md:mt-6">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Saved Lots</h2>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {wishlistProducts.map((product) => (
                    <Link href={`/products/${product._id}`} key={product._id}>
                      <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                        <CardContent className="p-3 md:p-4">
                          <div className="relative w-full h-32 md:h-48 rounded-md overflow-hidden">
                            <Image
                              src={product.image[0] || "/placeholder.svg"}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <h3 className="text-sm md:text-lg font-semibold mt-2 line-clamp-1">{product.title}</h3>
                          <p className="text-luxury-gold font-bold text-sm md:text-base">${product.price.toLocaleString()}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm md:text-base">No products saved in your wishlist.</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">Billing Information</h2>
            <BillingDetailsModal />
          </div>

          {auth?.billingDetails ? (
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">Name:</span>
                <span className="font-medium text-sm md:text-base">
                  {`${auth.billingDetails.firstName} ${auth.billingDetails.lastName}`}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">Company:</span>
                <span className="font-medium text-sm md:text-base">{auth.billingDetails.company_name || "-"}</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">Address:</span>
                <span className="font-medium text-sm md:text-base">{auth.billingDetails.streetAddress}</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">City:</span>
                <span className="font-medium text-sm md:text-base">{auth.billingDetails.city}</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">State:</span>
                <span className="font-medium text-sm md:text-base">{auth.billingDetails.state}</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">Zip Code:</span>
                <span className="font-medium text-sm md:text-base">{auth.billingDetails.zipcode || "-"}</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <span className="text-gray-600 text-sm md:text-base">Phone:</span>
                <span className="font-medium text-sm md:text-base">{auth.billingDetails.phone}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm md:text-base">No billing details available</p>
          )}
        </div>

        <p className="text-gray-600 text-xs md:text-sm mt-4 md:mt-6">
          Your account currently enables you to get updates, save lots, access sale details, and more. To bid, buy, and sell with NY Elizabeth, please take a moment to complete your profile.
        </p>
      </div>
      <Footer />
    </>
  );
}