"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Import Button component
import toast from "react-hot-toast";

const PaintingItemForm = ({ setCurrentStep, selectedCategory, formData, setFormData }) => {
  const [general, setGeneral] = useState({
    countryOrigin: formData.General?.countryOrigin || "",
    artist: formData.General?.artist || "",
    object: formData.General?.object || "Painting",
    material: formData.General?.material || "",
    tortoiseshell: formData.General?.tortoiseshell || "No",
    periodOfWork: formData.General?.periodOfWork || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGeneral((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      General: general,
      category: selectedCategory,
    }));
    setCurrentStep(3);
    toast.success("Painting details saved!");
  };

  return (
    <div className="bg-white mt-[80px]  p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Painting Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Country of Origin</label>
          <input
            type="text"
            name="countryOrigin"
            value={general.countryOrigin}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., France"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Artist</label>
          <input
            type="text"
            name="artist"
            value={general.artist}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Claude Monet"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Material</label>
          <input
            type="text"
            name="material"
            value={general.material}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Oil on Canvas"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Tortoiseshell</label>
          <select
            name="tortoiseshell"
            value={general.tortoiseshell}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Period of Work</label>
          <input
            type="text"
            name="periodOfWork"
            value={general.periodOfWork}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 19th Century"
          />
        </div>
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaintingItemForm;