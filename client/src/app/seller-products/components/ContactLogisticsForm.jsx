"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactLogisticsForm({ setCurrentStep, formData, setFormData }) {
    const [localData, setLocalData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        region: "",
        city: "",
        country: "",
        phone: "",
        sameLocation: false,
        contactPerson: false,
    });

    const handleChange = (field, value) => {
        setLocalData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!localData.firstName || !localData.email) {
            toast.error("First name and email are required!");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            logistic_info: {
                firstName: localData.firstName,
                lastName: localData.lastName,
                email: localData.email,
                state: localData.region,
                city: localData.city,
                country: localData.country,
                phone: localData.phone,
                samelocation: localData.sameLocation ? "Yes" : "No",
                handlingshipping: localData.contactPerson ? "Handled by seller" : "No",
            },
        }));
        setCurrentStep(5);
        toast.success("Logistics information saved!");
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Share Contact and Logistics Information
            </h1>

            <div className="bg-gray-50 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-semibold text-gray-700">First Name</label>
                    <input
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700">Last Name</label>
                    <input
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold text-gray-700">Email Address</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700">State</label>
                    <select
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.region}
                        onChange={(e) => handleChange("region", e.target.value)}
                    >
                        <option value="">Select State</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold text-gray-700">City</label>
                    <input
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700">Country</label>
                    <select
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                    >
                        <option value="">Select Country</option>
                        <option value="USA">USA</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">UK</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold text-gray-700">Phone</label>
                    <input
                        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={localData.sameLocation}
                        onChange={(e) => handleChange("sameLocation", e.target.checked)}
                    />
                    <span className="text-gray-700">Is the item in the same location as the owner?</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={localData.contactPerson}
                        onChange={(e) => handleChange("contactPerson", e.target.checked)}
                    />
                    <span className="text-gray-700">Contact this person regarding shipping and handling</span>
                </label>
            </div>

            <div className="flex justify-between mt-10">
                <button
                    className="px-6 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition-all"
                    onClick={() => setCurrentStep(3)}
                >
                    Back
                </button>
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
                    onClick={handleSubmit}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}