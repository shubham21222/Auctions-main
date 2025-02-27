"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function BillingDetailsForm({ user, token, onBillingUpdate }) {
  const [billingDetails, setBillingDetails] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    companyName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: user?.email || "",
    orderNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setBillingDetails((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateBilling = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      BillingDetails: [
        {
          firstName: billingDetails.firstName,
          lastName: billingDetails.lastName,
          company_name: billingDetails.companyName,
          streetAddress: billingDetails.streetAddress,
          city: billingDetails.city,
          state: billingDetails.state,
          zipcode: billingDetails.zipCode,
          phone: billingDetails.phone,
          email: billingDetails.email,
          orderNotes: billingDetails.orderNotes,
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:4000/v1/api/auth/UpdateBillingAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update billing address");

      toast.success("Billing address updated successfully!");
      onBillingUpdate(billingDetails); // Pass updated billing details back to parent
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to update billing address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-2xl bg-gray-50 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Billing Details</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={billingDetails.firstName}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={billingDetails.lastName}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <input
          name="companyName"
          type="text"
          placeholder="Company Name (Optional)"
          value={billingDetails.companyName}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="streetAddress"
          type="text"
          placeholder="Street Address"
          value={billingDetails.streetAddress}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="city"
            type="text"
            placeholder="City"
            value={billingDetails.city}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="state"
            type="text"
            placeholder="State"
            value={billingDetails.state}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="zipCode"
            type="text"
            placeholder="ZIP Code"
            value={billingDetails.zipCode}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="phone"
            type="text"
            placeholder="Phone"
            value={billingDetails.phone}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={billingDetails.email}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          name="orderNotes"
          placeholder="Order Notes (Optional)"
          value={billingDetails.orderNotes}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleUpdateBilling}
          disabled={loading}
          className={`w-full mt-4 bg-blue-600 text-white py-2 rounded-lg transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Update Billing Address"}
        </button>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
}