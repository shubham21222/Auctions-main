"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import countries from "i18n-iso-countries";

// Register English locale for browser environment
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

export default function BillingDetailsForm({ token, onBillingUpdate }) {
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    country: "", // Stores ISO Alpha-2 code (e.g., "IN")
    orderNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const countryList = countries.getNames("en", { select: "official" }); // { "IN": "India", "US": "United States", ... }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e) => {
    const isoCode = e.target.value;
    console.log("Selected Country ISO Code:", isoCode); // Should log "IN" for India
    setBillingDetails((prev) => ({
      ...prev,
      country: isoCode,
    }));
  };

  const handleUpdateBilling = async () => {
    if (!billingDetails.country) {
      setError("Country is required");
      toast.error("Country is required");
      return;
    }

    setLoading(true);
    setError(null);

    // API expects full country name, so map ISO code to name
    const countryFullName = countryList[billingDetails.country] || billingDetails.country;

    const payload = {
      BillingDetails: [
        {
          firstName: billingDetails.firstName,
          lastName: billingDetails.lastName,
          company_name: billingDetails.companyName,
          streetAddress: billingDetails.address,
          city: billingDetails.city,
          state: billingDetails.state,
          zipcode: billingDetails.zipCode,
          phone: billingDetails.phone,
          email: billingDetails.email,
          country: countryFullName, // Send full name to API
          orderNotes: billingDetails.orderNotes,
        },
      ],
    };

    try {
      const response = await fetch("https://bid.nyelizabeth.com/v1/api/auth/UpdateBillingAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update billing address");

      // Pass ISO code back to CheckoutContent
      const normalizedDetails = {
        firstName: billingDetails.firstName,
        lastName: billingDetails.lastName,
        address: billingDetails.address,
        city: billingDetails.city,
        state: billingDetails.state,
        zipCode: billingDetails.zipCode,
        phone: billingDetails.phone,
        email: billingDetails.email,
        country: billingDetails.country, // ISO code (e.g., "IN")
      };
      console.log("Normalized Details for CheckoutContent:", normalizedDetails);
      onBillingUpdate(normalizedDetails);
      toast.success("Billing address updated successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to update billing address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-6 text-gray-700">Billing Details</h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={billingDetails.firstName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={billingDetails.lastName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
          <input
            name="companyName"
            type="text"
            placeholder="Enter your company name"
            value={billingDetails.companyName}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Street Address</label>
          <input
            name="address"
            type="text"
            placeholder="Enter your street address"
            value={billingDetails.address}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              name="city"
              type="text"
              placeholder="Enter your city"
              value={billingDetails.city}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              name="state"
              type="text"
              placeholder="Enter your state"
              value={billingDetails.state}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              name="zipCode"
              type="text"
              placeholder="Enter your ZIP code"
              value={billingDetails.zipCode}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              type="text"
              placeholder="Enter your phone number"
              value={billingDetails.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={billingDetails.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <select
            name="country"
            value={billingDetails.country}
            onChange={handleCountryChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={loading}
            required
          >
            <option value="">Select a country</option>
            {Object.entries(countryList).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Order Notes (Optional)</label>
          <textarea
            name="orderNotes"
            placeholder="Add any additional notes for your order"
            value={billingDetails.orderNotes}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[100px] resize-y"
            disabled={loading}
          />
        </div>

        <button
          type="button"
          onClick={handleUpdateBilling}
          disabled={loading}
          className={`w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </div>
          ) : (
            "Update Billing Address"
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}