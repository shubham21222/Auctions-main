"use client";

import toast from "react-hot-toast";

const steps = ["Category", "Information", "Photos", "Logistics", "Review"];

export default function StepperForm({ selectedCategory, setSelectedCategory, setCurrentStep, setFormData, categories }) {
  const progressValue = (1 / steps.length) * 100;

  const handleContinue = () => {
    if (selectedCategory) {
      console.log("Continuing with Category ID:", selectedCategory);
      setFormData((prev) => ({ ...prev, category: selectedCategory }));
      setCurrentStep(2);
      toast.success("Category selected! Moving to next step.");
    } else {
      toast.error("Please select a category!");
    }
  };

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

      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                index === 0 ? "bg-blue-600 text-white" : "border-gray-400 text-gray-500"
              } transition-all`}
            >
              {index === 0 ? "✓" : index + 1}
            </div>
            <span
              className={`text-sm font-semibold ${
                index === 0 ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && <div className="w-12 h-0.5 bg-gray-300"></div>}
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Choose Your Category</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedCategory === category._id
                ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
            }`}
            onClick={() => setSelectedCategory(category._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-700">{category.name}</span>
              </div>
              {selectedCategory === category._id && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400"
          onClick={handleContinue}
          disabled={!selectedCategory}
        >
          Continue
        </button>
        <p className="text-sm mt-2 text-gray-500">Click "Continue" to save your progress</p>
      </div>
    </div>
  );
}