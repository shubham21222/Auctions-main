"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import config from "@/app/config_BASE_URL";
import { updateBillingDetails } from "@/redux/authSlice";

export default function BillingDetailsModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;
  const userId = auth?.user?._id;
  const dispatch = useDispatch(); 

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      company_name: "",
      streetAddress: "",
      city: "",
      state: "",
      zipcode: "",
      phone: "",
      email: "",
      orderNotes: "",
    },
  });

  // Fetch user details when modal opens
  useEffect(() => {
    if (!isModalOpen || !token || !userId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${config.baseURL}/v1/api/auth/getUserById/${userId}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        if (response.data.status && response.data.items?.BillingDetails?.length > 0) {
          const billingDetails = response.data.items.BillingDetails[0];
          // Set form values from existing billing details
          Object.keys(billingDetails).forEach((key) => {
            if (key !== "_id") {
              setValue(key, billingDetails[key]);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to fetch billing details");
      }
    };

    fetchUserDetails();
  }, [isModalOpen, token, userId, setValue]);

  const handleUpdateBillingDetails = async (data) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const payload = {
        BillingDetails: [data],
      };

      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/UpdateBillingAddress`,
        payload,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.status) {
        // Dispatch the updated billing details to Redux
        dispatch(updateBillingDetails(data));
        toast.success("Billing details updated successfully!");
        reset();
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to update billing details");
      }
    } catch (error) {
      console.error("Error updating billing details:", error);
      toast.error(error.response?.data?.message || "Failed to update billing details");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">Edit Billing Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Billing Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleUpdateBillingDetails)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                {...register("firstName", { required: "First name is required" })}
                disabled={isUpdating}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                {...register("lastName", { required: "Last name is required" })}
                disabled={isUpdating}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label>Company Name</Label>
              <Input {...register("company_name")} disabled={isUpdating} />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                {...register("phone", { required: "Phone number is required" })}
                type="tel"
                disabled={isUpdating}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label>Street Address</Label>
              <Input
                {...register("streetAddress", { required: "Street address is required" })}
                disabled={isUpdating}
              />
              {errors.streetAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message}</p>
              )}
            </div>

            <div>
              <Label>City</Label>
              <Input
                {...register("city", { required: "City is required" })}
                disabled={isUpdating}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label>State</Label>
              <Input
                {...register("state", { required: "State is required" })}
                disabled={isUpdating}
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>

            <div>
              <Label>Zip Code</Label>
              <Input {...register("zipcode")} disabled={isUpdating} />
            </div>

            {/* <div>
              <Label>Email</Label>
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                disabled={isUpdating}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div> */}

            <div className="col-span-2">
              <Label>Order Notes</Label>
              <Input {...register("orderNotes")} disabled={isUpdating} />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 