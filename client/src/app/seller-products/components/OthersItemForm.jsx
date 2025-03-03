"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const OthersItemForm = ({ setCurrentStep, selectedCategory, formData, setFormData }) => {
  const [general, setGeneral] = useState({
    object: formData.General?.object || "",
    material: formData.General?.material || "",
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
    toast.success("Others details saved!");
  };

  return (
    <div className="bg-white mt-[80px] p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Others Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Object</label>
          <input
            type="text"
            name="object"
            value={general.object}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Collectible"
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
            placeholder="e.g., Wood"
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

export default OthersItemForm;