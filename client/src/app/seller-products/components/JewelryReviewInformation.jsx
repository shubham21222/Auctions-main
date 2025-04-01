"use client";

import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
const JewelryReviewInformation = ({ setCurrentStep, selectedCategory, formData, setFormData }) => {
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;
  const userId = auth?._id;

  const handleSubmit = async () => {
    if (!token || !userId) {
      toast.error("Authentication required! Please log in.");
      return;
    }

    const payload = {
      ...formData,
      Approved: false,
      createdBy: userId,
    };

    try {
      const response = await fetch(`${config.baseURL}/v1/api/seller/create`, {
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
        setCurrentStep(1);
      } else {
        toast.error("Submission failed: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting!");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Review Jewelry Information</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">General</h2>
            <hr className="my-2" />
            <p><strong>Material:</strong> {formData.General?.material || "N/A"}</p>
            <p><strong>Carat:</strong> {formData.General?.carat || "N/A"}</p>
            <p><strong>Gemstone:</strong> {formData.General?.gemstone || "N/A"}</p>
            <p><strong>Condition:</strong> {formData.General?.condition || "N/A"}</p>
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Documents</h2>
            <hr className="my-2" />
            {Object.entries(formData.Documents || {}).map(([key, value]) => (
              <p key={key}>
                <strong className="capitalize">{key.replace("Image", " Image")}:</strong>{" "}
                {value ? (
                  <img src={value} alt={key} className="w-20 h-20 object-cover inline-block ml-2" />
                ) : (
                  "N/A"
                )}
              </p>
            ))}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Logistics</h2>
            <hr className="my-2" />
            {Object.entries(formData.logistic_info || {}).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value || "N/A"}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          onClick={() => setCurrentStep(4)}
          className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default JewelryReviewInformation;