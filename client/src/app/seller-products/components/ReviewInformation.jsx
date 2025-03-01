"use client";

import { useSelector } from "react-redux";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ReviewInformation({ setCurrentStep, selectedCategory, formData, setFormData }) {
    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 5;

    // Get token and userId from Redux store (auth slice)
    const auth = useSelector((state) => state.auth);
    const token = auth?.token;
    const userId = auth?._id;

    const [isSubmitted, setIsSubmitted] = useState(false); // State to toggle Thank You page

    const handleSubmit = async () => {
        if (!token || !userId) {
            toast.error("Authentication required! Please log in.");
            return;
        }

        const payload = {
            category: formData.category,
            General: formData.General || {},
            Measurement: formData.Measurement || {},
            Condition: formData.Condition || {},
            Provenance: formData.Provenance || {},
            price: formData.price || {},
            Documents: formData.Documents || {},
            logistic_info: formData.logistic_info || {},
            Approved: false,
            createdBy: userId,
        };

        try {
            const response = await fetch("https://bid.nyelizabeth.com/v1/api/seller/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success("Form submitted successfully!");
                setIsSubmitted(true); // Show Thank You page
                console.log("Response:", result);
            } else {
                toast.error("Submission failed: " + result.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An error occurred while submitting!");
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold text-green-600 mb-4">Thank You!</h1>
                <p className="text-lg text-gray-700 text-center">
                    Thank you for submitting your item for sale with us. We will contact you shortly to proceed further.
                </p>
                <button
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
                    onClick={() => setCurrentStep(1)} // Reset to first step or redirect as needed
                >
                    Submit Another Item
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Review Information</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Category */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700">Category</h2>
                        <hr className="my-4" />
                        <p>Category ID: {formData.category || "N/A"}</p>
                    </div>

                    {/* Details */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700">Details</h2>
                        <hr className="my-4" />
                        {Object.entries({
                            ...formData.General,
                            ...formData.Measurement,
                            ...formData.Condition,
                            ...formData.Provenance,
                            ...formData.price,
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
                        {Object.entries(formData.Documents || {}).map(([key, value]) => (
                            <p key={key} className="text-gray-600">
                                <span className="font-semibold">{key}:</span>{" "}
                                {value ? (
                                    <img src={value} alt={key} className="w-20 h-20 object-cover inline-block" />
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
                        {Object.entries(formData.logistic_info || {}).map(([key, value]) => (
                            <p key={key} className="text-gray-600">
                                <span className="font-semibold">{key}:</span> {value || "N/A"}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-10">
                <button
                    className="px-6 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition-all"
                    onClick={() => setCurrentStep(4)}
                >
                    Back
                </button>
                <button
                    className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}