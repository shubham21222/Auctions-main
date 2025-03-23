"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSelector, useDispatch } from "react-redux";
import { updateBillingDetails } from "@/redux/authSlice";

export default function BillingDetailsModal({ isOpen, onClose, onBillingUpdate }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    country: "",
    orderNotes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
          country: billingDetails.country, // Full name for API
          orderNotes: billingDetails.orderNotes,
        },
      ],
    };

    try {
      const response = await fetch("https://bid.nyelizabeth.com/v1/api/auth/UpdateBillingAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update billing address");

      const normalizedDetails = {
        firstName: billingDetails.firstName,
        lastName: billingDetails.lastName,
        address: billingDetails.address,
        city: billingDetails.city,
        state: billingDetails.state,
        zipCode: billingDetails.zipCode,
        phone: billingDetails.phone,
        email: billingDetails.email,
        country: billingDetails.country,
      };

      dispatch(updateBillingDetails(normalizedDetails)); // Update Redux store
      onBillingUpdate(normalizedDetails); // Callback to parent
      toast.success("Billing address updated successfully!");
      onClose(); // Close modal
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to update billing address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-gradient-to-br from-white to-gray-100 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            Update Your Billing Details
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={billingDetails.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={billingDetails.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="companyName" className="text-gray-700 font-medium">
                  Company Name (Optional)
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={billingDetails.companyName}
                  onChange={handleInputChange}
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Company"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  Street Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={billingDetails.address}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-gray-700 font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={billingDetails.city}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-gray-700 font-medium">
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={billingDetails.state}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NY"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="zipCode" className="text-gray-700 font-medium">
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={billingDetails.zipCode}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10001"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={billingDetails.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 123-456-7890"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={billingDetails.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-gray-700 font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={billingDetails.country}
                  onChange={handleInputChange}
                  required
                  className="mt-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="United States"
                />
              </div>
              <div>
                <Label htmlFor="orderNotes" className="text-gray-700 font-medium">
                  Order Notes (Optional)
                </Label>
                <textarea
                  id="orderNotes"
                  name="orderNotes"
                  value={billingDetails.orderNotes}
                  onChange={handleInputChange}
                  className="mt-1 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2"
                  rows="4"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </form>
        <DialogFooter className="p-6 flex justify-center space-x-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-32"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}