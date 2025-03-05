"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { updateBillingDetails } from "@/redux/authSlice"; // Import the new action

export default function BillingDetailsForm({ token }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isBillingDetailsAvailable = useSelector((state) => state.auth.isBillingDetailsAvailable);
  const billingDetailsFromRedux = useSelector((state) => state.auth.user?.BillingDetails[0] || {});

  const [isEditing, setIsEditing] = useState(!isBillingDetailsAvailable); // Enable form if no details exist
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    orderNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form with user data or existing billing details
  useEffect(() => {
    if (user) {
      const initialDetails = isBillingDetailsAvailable
        ? {
            firstName: billingDetailsFromRedux.firstName || "",
            lastName: billingDetailsFromRedux.lastName || "",
            companyName: billingDetailsFromRedux.company_name || "",
            streetAddress: billingDetailsFromRedux.streetAddress || "",
            city: billingDetailsFromRedux.city || "",
            state: billingDetailsFromRedux.state || "",
            zipCode: billingDetailsFromRedux.zipcode || "",
            phone: billingDetailsFromRedux.phone || "",
            email: billingDetailsFromRedux.email || user.email || "",
            orderNotes: billingDetailsFromRedux.orderNotes || "",
          }
        : {
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            companyName: "",
            streetAddress: "",
            city: "",
            state: "",
            zipCode: "",
            phone: "",
            email: user.email || "",
            orderNotes: "",
          };
      setBillingDetails(initialDetails);
    }
  }, [user, isBillingDetailsAvailable, billingDetailsFromRedux]);

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

      // Update Redux with new billing details
      dispatch(updateBillingDetails(payload.BillingDetails[0]));
      setIsEditing(false); // Disable editing after successful update
      toast.success("Billing address updated successfully!");
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
      {isBillingDetailsAvailable && !isEditing ? (
        <div className="space-y-2">
          <p><strong>First Name:</strong> {billingDetails.firstName}</p>
          <p><strong>Last Name:</strong> {billingDetails.lastName}</p>
          {billingDetails.companyName && <p><strong>Company Name:</strong> {billingDetails.companyName}</p>}
          <p><strong>Street Address:</strong> {billingDetails.streetAddress}</p>
          <p><strong>City:</strong> {billingDetails.city}</p>
          <p><strong>State:</strong> {billingDetails.state}</p>
          <p><strong>ZIP Code:</strong> {billingDetails.zipCode}</p>
          <p><strong>Phone:</strong> {billingDetails.phone}</p>
          <p><strong>Email:</strong> {billingDetails.email}</p>
          {billingDetails.orderNotes && <p><strong>Order Notes:</strong> {billingDetails.orderNotes}</p>}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Edit Billing Details
          </button>
        </div>
      ) : (
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
              disabled={loading}
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={billingDetails.lastName}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <input
            name="companyName"
            type="text"
            placeholder="Company Name (Optional)"
            value={billingDetails.companyName}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <input
            name="streetAddress"
            type="text"
            placeholder="Street Address"
            value={billingDetails.streetAddress}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
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
              disabled={loading}
            />
            <input
              name="state"
              type="text"
              placeholder="State"
              value={billingDetails.state}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
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
              disabled={loading}
            />
            <input
              name="phone"
              type="text"
              placeholder="Phone"
              value={billingDetails.phone}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
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
            disabled={loading}
          />
          <textarea
            name="orderNotes"
            placeholder="Order Notes (Optional)"
            value={billingDetails.orderNotes}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
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
      )}
    </div>
  );
}