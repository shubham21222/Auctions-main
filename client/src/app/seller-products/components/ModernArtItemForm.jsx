"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ModernArtItemForm = ({ setCurrentStep, selectedCategory, formData, setFormData }) => {
  const [general, setGeneral] = useState({
    countryOrigin: formData.General?.countryOrigin || "",
    Artist: formData.General?.Artist || "",
    object: formData.General?.object || "Painting",
    material: formData.General?.material || "",
    tortoiseshell: formData.General?.tortoiseshell || "No",
    periodOfwork: formData.General?.periodOfwork || "",
  });
  const [measurement, setMeasurement] = useState({
    Unit: formData.Measurement?.Unit || "cm",
    framed: formData.Measurement?.framed || "No",
    height: formData.Measurement?.height || "",
    width: formData.Measurement?.width || "",
    depth: formData.Measurement?.depth || "",
    Unframedheight: formData.Measurement?.Unframedheight || "",
    Unframedwidth: formData.Measurement?.Unframedwidth || "",
    Unframeddepth: formData.Measurement?.Unframeddepth || "",
    weight: formData.Measurement?.weight || "",
  });
  const [dimensions, setDimensions] = useState({
    height_length: formData.Dimensions?.height_length || "",
    width: formData.Dimensions?.width || "",
  });
  const [condition, setCondition] = useState({
    Signatures: formData.Condition?.Signatures || "",
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
      Dimensions: dimensions,
      Condition: condition,
      Provenance: provenance,
      price: price,
      category: selectedCategory,
    }));
    setCurrentStep(3);
    toast.success("Modern Art details saved!");
  };

  return (
    <div className="max-w-6xl mt-[80px] mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Modern Art Details</h1>
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
                placeholder="e.g., France"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Artist</label>
              <input
                type="text"
                name="Artist"
                value={general.Artist}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Pablo Picasso"
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
                placeholder="e.g., Painting"
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
                placeholder="e.g., Oil on Canvas"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tortoiseshell</label>
              <select
                name="tortoiseshell"
                value={general.tortoiseshell}
                onChange={handleChange(setGeneral)}
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
                name="periodOfwork"
                value={general.periodOfwork}
                onChange={handleChange(setGeneral)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20th Century"
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
                placeholder="e.g., cm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Framed</label>
              <select
                name="framed"
                value={measurement.framed}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Height</label>
              <input
                type="text"
                name="height"
                value={measurement.height}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Width</label>
              <input
                type="text"
                name="width"
                value={measurement.width}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 70"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Depth</label>
              <input
                type="text"
                name="depth"
                value={measurement.depth}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Unframed Height</label>
              <input
                type="text"
                name="Unframedheight"
                value={measurement.Unframedheight}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 95"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Unframed Width</label>
              <input
                type="text"
                name="Unframedwidth"
                value={measurement.Unframedwidth}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 65"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Unframed Depth</label>
              <input
                type="text"
                name="Unframeddepth"
                value={measurement.Unframeddepth}
                onChange={handleChange(setMeasurement)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4"
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
                placeholder="e.g., 8kg"
              />
            </div>
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Dimensions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Height/Length</label>
              <input
                type="text"
                name="height_length"
                value={dimensions.height_length}
                onChange={handleChange(setDimensions)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 120"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Width</label>
              <input
                type="text"
                name="width"
                value={dimensions.width}
                onChange={handleChange(setDimensions)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 80"
              />
            </div>
          </div>
        </div>

        {/* Condition Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Condition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Signatures</label>
              <input
                type="text"
                name="Signatures"
                value={condition.Signatures}
                onChange={handleChange(setCondition)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Artist Signed"
              />
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
                placeholder="e.g., Acquired from an art gallery"
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

export default ModernArtItemForm;