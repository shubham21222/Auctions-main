"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const steps = ["Category", "Information", "Photos", "Logistics", "Review"];

export default function ItemForm({ setCurrentStep, selectedCategory, formData, setFormData }) {
    const [localFormData, setLocalFormData] = useState({
        General: {
            countryOrigin: "",
            Artist: "",
            object: "",
            material: "",
            tortoiseshell: "No",
            periodOfwork: "",
        },
        Measurement: {
            framed: "No",
            height: "",
            width: "",
            depth: "",
            weight: "",
        },
        Condition: {
            Signatures: "",
            AreaofDamage: "",
            restoration: "",
        },
        Provenance: {
            historyofownership: "",
            Appraisals: "",
        },
        price: {
            paidPrice: "",
            currency: "USD",
            paidYear: "",
            Notes: "",
        },
    });

    const handleChange = (section, field, value) => {
        setLocalFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleContinue = () => {
        setFormData((prev) => ({ ...prev, ...localFormData }));
        setCurrentStep(3);
        toast.success("Item information saved! Moving to next step.");
    };

    const progressValue = 40;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
            <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressValue}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-8">{/* Stepper code */}</div>

            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Tell Us About Your Item</h2>

            <div className="space-y-8">
                {/* General */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">General</h3>
                    <input
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Country of Origin"
                        value={localFormData.General.countryOrigin}
                        onChange={(e) => handleChange("General", "countryOrigin", e.target.value)}
                    />
                    <input
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Artist / Maker"
                        value={localFormData.General.Artist}
                        onChange={(e) => handleChange("General", "Artist", e.target.value)}
                    />
                    <textarea
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What is the object?"
                        value={localFormData.General.object}
                        onChange={(e) => handleChange("General", "object", e.target.value)}
                    />
                    <input
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Material"
                        value={localFormData.General.material}
                        onChange={(e) => handleChange("General", "material", e.target.value)}
                    />
                    <input
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Period of Work"
                        value={localFormData.General.periodOfwork}
                        onChange={(e) => handleChange("General", "periodOfwork", e.target.value)}
                    />
                </div>

                {/* Measurements */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Measurements</h3>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={localFormData.Measurement.framed === "Yes"}
                            onChange={(e) =>
                                handleChange("Measurement", "framed", e.target.checked ? "Yes" : "No")
                            }
                        />
                        <span>Yes, it is framed</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <input
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Height"
                            value={localFormData.Measurement.height}
                            onChange={(e) => handleChange("Measurement", "height", e.target.value)}
                        />
                        <input
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Width"
                            value={localFormData.Measurement.width}
                            onChange={(e) => handleChange("Measurement", "width", e.target.value)}
                        />
                        <input
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Depth"
                            value={localFormData.Measurement.depth}
                            onChange={(e) => handleChange("Measurement", "depth", e.target.value)}
                        />
                        <input
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Weight"
                            value={localFormData.Measurement.weight}
                            onChange={(e) => handleChange("Measurement", "weight", e.target.value)}
                        />
                    </div>
                </div>

                {/* Condition */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Condition</h3>
                    <input
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Signatures"
                        value={localFormData.Condition.Signatures}
                        onChange={(e) => handleChange("Condition", "Signatures", e.target.value)}
                    />
                    <input
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Areas of Damage"
                        value={localFormData.Condition.AreaofDamage}
                        onChange={(e) => handleChange("Condition", "AreaofDamage", e.target.value)}
                    />
                    <input
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Restoration"
                        value={localFormData.Condition.restoration}
                        onChange={(e) => handleChange("Condition", "restoration", e.target.value)}
                    />
                </div>

                {/* Provenance */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Provenance</h3>
                    <input
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="History of Ownership"
                        value={localFormData.Provenance.historyofownership}
                        onChange={(e) => handleChange("Provenance", "historyofownership", e.target.value)}
                    />
                    <textarea
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Appraisals"
                        value={localFormData.Provenance.Appraisals}
                        onChange={(e) => handleChange("Provenance", "Appraisals", e.target.value)}
                    />
                </div>

                {/* Price */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Price</h3>
                    <input
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price Paid"
                        value={localFormData.price.paidPrice}
                        onChange={(e) => handleChange("price", "paidPrice", e.target.value)}
                    />
                    <select
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localFormData.price.currency}
                        onChange={(e) => handleChange("price", "currency", e.target.value)}
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                    <input
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Year Paid"
                        value={localFormData.price.paidYear}
                        onChange={(e) => handleChange("price", "paidYear", e.target.value)}
                    />
                    <textarea
                        className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Notes"
                        value={localFormData.price.Notes}
                        onChange={(e) => handleChange("price", "Notes", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-between mt-10">
                <button
                    className="px-6 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition-all"
                    onClick={() => setCurrentStep(1)}
                >
                    Back
                </button>
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}