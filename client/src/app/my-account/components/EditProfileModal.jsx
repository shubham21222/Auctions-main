"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setEmail } from "@/redux/authSlice"; // Import setEmail action
import config from "@/app/config_BASE_URL";

export default function EditProfileModal() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal open state
  const auth = useSelector((state) => state.auth); // Access Redux state
  const dispatch = useDispatch(); // Redux dispatch
  const token = auth?.token || null;

  // Fetch user profile data when modal opens
  useEffect(() => {
    if (!isModalOpen || !token) return; // Only fetch data if modal is open and token exists

    const fetchProfile = async () => {
      try {
        const response = await axios.post(
          `${config.baseURL}/v1/api/auth/updateProfile`,
          {},
          { headers: { Authorization: `${token}` } }
        );

        console.log("Profile data fetched successfully:", response.data);

        // Extract email from the response
        const userEmail = response.data.items?.email;

        if (userEmail) {
          // Save the email in Redux
          dispatch(setEmail(userEmail));
        } else {
          console.error("Email not found in API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.response?.data || error.message);
        // toast.error("An error occurred while fetching your profile. Please try again.");
      }
    };

    fetchProfile();
  }, [isModalOpen, token, dispatch]); // Trigger fetch when modal opens

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: auth.items.email ? auth.items.email.split("@")[0] : "", // Derive username from email
      email: auth.items.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form values when email is fetched
  useEffect(() => {
    if (auth.items.email) {
      setValue("name", auth.items.email.split("@")[0]); // Set username derived from email
      setValue("email", auth.items.email); // Set email
    }
  }, [auth.items.email, setValue]);

  // Handle profile update
  const handleUpdateProfile = async (data) => {
    try {
      if (!token) {
        toast.error("No token available. Please log in.");
        return;
      }

      const payload = {
        name: data.name,
        email: data.email,
      };

      const response = await axios.post(`${config.baseURL}/v1/api/auth/updateProfile`, payload, {
        headers: { Authorization: `${token}` },
      });

      console.log("Profile updated successfully:", response.data);
      toast.success("Your profile has been updated successfully!");

      // Close the modal after successful profile update
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "An error occurred while updating your profile.");
    }
  };

  // Handle password reset
  const handleResetPassword = async (data) => {
    try {
      if (!token) {
        toast.error("No token available. Please log in.");
        return;
      }

      // Validate that newPassword and confirmPassword match
      if (data.newPassword !== data.confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }

      const payload = {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await axios.post(`${config.baseURL}/v1/api/auth/updatePassword`, payload, {
        headers: { Authorization: `${token}` },
      });

      console.log("Password reset successful:", response.data);
      toast.success("Your password has been reset successfully!");

      // Close the modal after successful password reset
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error resetting password:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "An error occurred while resetting your password.");
    }
  };

  return (
    <Dialog onOpenChange={setIsModalOpen}> {/* Track modal open state */}
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input {...register("name")} required />
          </div>

          <div>
            <Label>Email</Label>
            <Input {...register("email")} type="email" required />
          </div>

          <h2 className="text-lg font-semibold mt-4">Change Password</h2>

          <div className="relative">
            <Label>Current Password</Label>
            <Input {...register("currentPassword")} type={showPassword ? "text" : "password"} />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="relative">
            <Label>New Password</Label>
            <Input {...register("newPassword")} type={showNewPassword ? "text" : "password"} />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="relative">
            <Label>Confirm Password</Label>
            <Input {...register("confirmPassword")} type={showNewPassword ? "text" : "password"} />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit(handleResetPassword)}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}