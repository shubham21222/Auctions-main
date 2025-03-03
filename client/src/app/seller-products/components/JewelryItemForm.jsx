"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const JewelryItemForm = ({ setCurrentStep, selectedCategory, formData, setFormData }) => {
  const [general, setGeneral] = useState({
    countryOrigin: formData.General?.countryOrigin || "",
    object: formData.General?.object || "Jewelry",
    material: formData.General?.material || "",
    caseMaterial: formData.General?.caseMaterial || "",
    serialNumber: formData.General?.serialNumber || "",
  });
  const [measurement, setMeasurement] = useState({
    Unit: formData.Measurement?.Unit || "g",
    weight: formData.Measurement?.weight || "",
  });
  const [condition, setCondition] = useState({
    picesInorginalcases: formData.Condition?.picesInorginalcases || "No",
    picesOriginalcertificates: formData.Condition?.picesOriginalcertificates || "No",
    AreaofDamage: formData.Condition?.AreaofDamage || "",
    discribeDamage: formData.Condition?.discribeDamage || "",
    restoration: formData.Condition?.restoration || "",
  });
  const [provenance, setProvenance] = useState({
    historyofownership: formData.Provenance?.historyofownership || "",
    Appraisals: formData.Provenance?.Appraisals || "",
  });
  const [price, setPrice] = useState({
    paidPrice: formData.price?.paidPrice || "",
    currency: formData.price?.currency || "USD",
    paidYear: formData.price?.paidYear || "",
    Notes: formData.price?.Notes || "",
  });

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      General: general,
      Measurement: measurement,
      Condition: condition,
      Provenance: provenance,
      price: price,
      category: selectedCategory,
    }));
    setCurrentStep(3);
    toast.success("Jewelry details saved!");
  };

  return (
    <div className="max-w-6xl mt-[80px] mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Jewelry Details</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Country of Origin</label>
              <input
                type="text"
                name="countryOrigin"
                value={general.countryOrigin}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Germany"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Name of Product (Object)</label>
              <input
                type="text"
                name="object"
                value={general.object}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Necklace"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Material</label>
              <input
                type="text"
                name="material"
                value={general.material}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Case Material</label>
              <input
                type="text"
                name="caseMaterial"
                value={general.caseMaterial}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Wood"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                value={general.serialNumber}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SN-98765"
              />
            </div>
          </div>
        </div>

        {/* Measurement Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Measurement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Unit</label>
              <input
                type="text"
                name="Unit"
                value={measurement.Unit}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., g"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Weight</label>
              <input
                type="text"
                name="weight"
                value={measurement.weight}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10g"
              />
            </div>
          </div>
        </div>

        {/* Condition Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Condition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Pieces in Original Cases</label>
              <select
                name="picesInorginalcases"
                value={condition.picesInorginalcases}
                onChange={handleChange(setCondition)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Pieces with Original Certificates</label>
              <select
                name="picesOriginalcertificates"
                value={condition.picesOriginalcertificates}
                onChange={handleChange(setCondition)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Area of Damage</label>
              <input
                type="text"
                name="AreaofDamage"
                value={condition.AreaofDamage}
                onChange={handleChange(setCondition)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Minor scratches"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Describe Damage</label>
              <input
                type="text"
                name="discribeDamage"
                value={condition.discribeDamage}
                onChange={handleChange(setCondition)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Slightly worn edges"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Restoration</label>
              <input
                type="text"
                name="restoration"
                value={condition.restoration}
                onChange={handleChange(setCondition)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., No prior restorations"
              />
            </div>
          </div>
        </div>

        {/* Provenance Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Provenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">History of Ownership</label>
              <input
                type="text"
                name="historyofownership"
                value={provenance.historyofownership}
                onChange={handleChange(setProvenance)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Owned by a private collector"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Appraisals</label>
              <input
                type="text"
                name="Appraisals"
                value={provenance.Appraisals}
                onChange={handleChange(setProvenance)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Valued at $50,000"
              />
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Price Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Paid Price</label>
              <input
                type="text"
                name="paidPrice"
                value={price.paidPrice}
                onChange={handleChange(setPrice)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Currency</label>
              <input
                type="text"
                name="currency"
                value={price.currency}
                onChange={handleChange(setPrice)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., USD"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Paid Year</label>
              <input
                type="text"
                name="paidYear"
                value={price.paidYear}
                onChange={handleChange(setPrice)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2018"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Notes</label>
              <input
                type="text"
                name="Notes"
                value={price.Notes}
                onChange={handleChange(setPrice)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Acquired from a jewelry store"
              />
            </div>
          </div>
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

export default JewelryItemForm;