"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";

const SellerDetailsPage = () => {
    const [sellerData, setSellerData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get user ID and token from Redux store (auth slice)
    const auth = useSelector((state) => state.auth);
    const userId = auth?._id;
    const token = auth?.token;

    useEffect(() => {
        const fetchSellerData = async () => {
            if (!userId || !token) {
                toast.error("Authentication required! Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://bid.nyelizabeth.com/v1/api/seller/getbyid/${userId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `${token}`,
                        },
                    }
                );

                const result = await response.json();
                if (response.ok && result.status === "Seller") {
                    setSellerData(result.message);
                    toast.success("Seller data loaded successfully!");
                } else {
                    toast.error("You are not a Seller: " + (result.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error fetching seller data:", error);
                toast.error("An error occurred while fetching seller data!");
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [userId, token]);

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
                <div className="max-w-6xl mx-auto p-6">
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <p className="text-xl text-gray-600">Loading...</p>
                        </div>
                    ) : !sellerData ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <p className="text-xl text-red-600">No data available. Please try again later.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Seller Details</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    {/* Category */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-xl font-semibold text-gray-700">Category</h2>
                                        <hr className="my-4" />
                                        <p>
                                            <span className="font-semibold">Category Name:</span>{" "}
                                            {sellerData.category?.name || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Category ID:</span>{" "}
                                            {sellerData.category?._id || "N/A"}
                                        </p>
                                    </div>

                                    {/* Details */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-xl font-semibold text-gray-700">Details</h2>
                                        <hr className="my-4" />
                                        {Object.entries({
                                            ...sellerData.General,
                                            ...sellerData.Measurement,
                                            ...sellerData.Condition,
                                            ...sellerData.Provenance,
                                            ...sellerData.price,
                                        }).map(([key, value]) => (
                                            <p key={key} className="text-gray-600">
                                                <span className="font-semibold">{key}:</span> {value || "N/A"}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    {/* Images & Documents */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-xl font-semibold text-gray-700">Images & Documents</h2>
                                        <hr className="my-4" />
                                        {Object.entries(sellerData.Documents || {}).map(([key, value]) => (
                                            <p key={key} className="text-gray-600">
                                                <span className="font-semibold capitalize">
                                                    {key.replace("Image", " Image")}:
                                                </span>{" "}
                                                {value ? (
                                                    <Image
                                                        src={value}
                                                        alt={key}
                                                        width={80}
                                                        height={80}
                                                        className="object-cover inline-block ml-2"
                                                    />
                                                ) : (
                                                    "N/A"
                                                )}
                                            </p>
                                        ))}
                                    </div>

                                    {/* Logistics */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-xl font-semibold text-gray-700">Logistics</h2>
                                        <hr className="my-4" />
                                        {Object.entries(sellerData.logistic_info || {}).map(([key, value]) => (
                                            <p key={key} className="text-gray-600">
                                                <span className="font-semibold">{key}:</span> {value || "N/A"}
                                            </p>
                                        ))}
                                    </div>

                                    {/* Metadata */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-xl font-semibold text-gray-700">Metadata</h2>
                                        <hr className="my-4" />
                                        <p>
                                            <span className="font-semibold">Seller ID:</span> {sellerData._id || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Approved:</span>{" "}
                                            {sellerData.Approved ? "Yes" : "No"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Created By:</span>{" "}
                                            {sellerData.createdBy?.name} ({sellerData.createdBy?.email})
                                        </p>
                                        <p>
                                            <span className="font-semibold">Created At:</span>{" "}
                                            {new Date(sellerData.createdAt).toLocaleString()}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Updated At:</span>{" "}
                                            {new Date(sellerData.updatedAt).toLocaleString()}
                                        </p>
                                        {sellerData.ApprovedBy && (
                                            <p>
                                                <span className="font-semibold">Approved By:</span>{" "}
                                                {sellerData.ApprovedBy.name} ({sellerData.ApprovedBy.email})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SellerDetailsPage;