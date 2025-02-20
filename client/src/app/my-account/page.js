"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Image from "next/image"; // Import Image for optimized images
import Link from "next/link"; // Import Link for navigation
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditProfileModal from "./components/EditProfileModal";
import config from "../config_BASE_URL";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const tabs = ["Profile", "Saved Lots", "Bids", "Purchases", "Seller Portal", "Address"];
    const auth = useSelector((state) => state.auth); // Access the Redux state

    // State to store wishlist products
    const [wishlistProducts, setWishlistProducts] = useState([]);

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${config.baseURL}/v1/api/auth/updateProfile`, {
                    headers: {
                        Authorization: `${auth.token}`,
                    },
                });

                // Dispatch the setEmail action to save the email in Redux
                if (response.data.items && response.data.items.email) {
                    dispatch(setEmail(response.data.items.email));
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchProfile();
    }, [auth.token]);

    // Fetch wishlist products when the "Saved Lots" tab is active
    useEffect(() => {
        if (activeTab === "Saved Lots") {
            fetchWishlist();
        }
    }, [activeTab, auth.token]);

    // Function to fetch wishlist products
    const fetchWishlist = async () => {
        try {
            const response = await axios.get(`${config.baseURL}/v1/api/favorite/all`, {
                headers: {
                    Authorization: `${auth.token}`, // Include the token in the headers
                },
            });

            // Extract the wishlist products from the response
            const wishlistItems = response.data.items.map((item) => item.product);
            setWishlistProducts(wishlistItems);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    };

    return (
        <>
            <Header />
            <div className="max-w-7xl mt-[80px] mx-auto p-6">
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <h1 className="text-2xl font-semibold">My account</h1>
                    <p className="text-lg font-medium mt-2">{auth.items.email ? auth.items.email.split("@")[0] : "Loading..."}</p>
                    <p className="text-blue-600">{auth.items.email || "Loading..."}</p>
                </div>

                <div className="flex border-b mt-6 space-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`pb-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-600"}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "Profile" && (
                    <Card className="mt-6">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
                            <div className="bg-gray-100 p-4 rounded-md">
                                <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                                    <span>Name</span>
                                    <span>Email</span>
                                    <span>Mobile Number</span>
                                    <span>Password</span>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mt-2 text-gray-700">
                                    <span>{auth.items.email ? auth.items.email.split("@")[0] : "Loading..."}</span>
                                    <span>{auth.items.email || "Loading..."}</span>
                                    <span>-</span>
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
                    <Card className="mt-6">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Saved Lots</h2>
                            {wishlistProducts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlistProducts.map((product) => (
                                        <Link href={`/products/${product._id}`} key={product._id}>
                                            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                                                <CardContent className="p-4">
                                                    {/* Use Next.js Image for optimized rendering */}
                                                    <div className="relative w-full h-48 rounded-md overflow-hidden">
                                                        <Image
                                                            src={product.image[0]} // Assuming image is an array
                                                            alt={product.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <h3 className="text-lg font-semibold mt-2 line-clamp-1">{product.title}</h3>
                                                    <p className="text-luxury-gold font-bold">${product.price.toLocaleString()}</p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No products saved in your wishlist.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <p className="text-gray-600 text-sm mt-6">
                    Your account currently enables you to get updates, save lots, access sale details, and more. To bid, buy, and sell with NY Elizabeth, please take a moment to complete your profile.
                </p>
            </div>
            <Footer />
        </>
    );
}