"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditProfileModal from "./components/EditProfileModal";
import { setEmail } from "@/redux/authSlice";


export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const tabs = ["Profile", "Saved Lots", "Bids", "Purchases", "Seller Portal", "Address"];
    const auth = useSelector((state) => state.auth); // Access the Redux state
    const dispatch = useDispatch();

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:4000/v1/api/auth/updateProfile", {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
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
    }, [auth.token, dispatch]);

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

                <p className="text-gray-600 text-sm mt-6">
                    Your account currently enables you to get updates, save lots, access sale details, and more. To bid, buy, and sell with NY Elizabeth, please take a moment to complete your profile.
                </p>
            </div>
            <Footer />
        </>
    );
}