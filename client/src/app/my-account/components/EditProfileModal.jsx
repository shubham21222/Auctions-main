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
import { setEmail, setUser, updateBillingDetails } from "@/redux/authSlice";
import config from "@/app/config_BASE_URL";

export default function EditProfileModal() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const token = auth?.token || null;

  // Fetch user profile data when modal opens
  useEffect(() => {
    if (!isModalOpen || !token) return;

    const fetchProfile = async () => {
      try {
        const response = await axios.post(
          `${config.baseURL}/v1/api/auth/updateProfile`,
          {},
          { headers: { Authorization: `${token}` } }
        );

        if (response.data.status && response.data.items) {
          const userData = response.data.items;
          dispatch(setUser(userData));
          dispatch(setEmail(userData.email));
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.response?.data || error.message);
        toast.error("Failed to fetch profile data");
      }
    };

    fetchProfile();
  }, [isModalOpen, token, dispatch]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: auth.items?.name || "",
      email: auth.items?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const email = watch("email");

  // Update username when email changes
  useEffect(() => {
    if (email) {
      const username = email.split('@')[0];
      setValue("name", username);
    }
  }, [email, setValue]);

  // Update form values when auth state changes
  useEffect(() => {
    if (auth.items) {
      setValue("email", auth.items.email || "");
      // Set initial username from email
      if (auth.items.email) {
        const username = auth.items.email.split('@')[0];
        setValue("name", username);
      }
    }
  }, [auth.items, setValue]);

  // Handle profile update
  const handleUpdateProfile = async (data) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if (!token) {
        toast.error("No token available. Please log in.");
        return;
      }

      const payload = {
        name: data.name,
        email: data.email,
      };

      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/updateProfile`,
        payload,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.status) {
        // Update Redux state with new user data
        dispatch(setUser(response.data.items));
        dispatch(setEmail(response.data.items.email));
        
        // If billing details are included in the response, update them too
        if (response.data.items?.BillingDetails?.length > 0) {
          dispatch(updateBillingDetails(response.data.items.BillingDetails[0]));
        }
        
        toast.success("Your profile has been updated successfully!");
        reset();
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      
      // Handle duplicate email error
      if (error.response?.data?.subCode === 500 && 
          error.response?.data?.message?.includes("duplicate key error")) {
        toast.error("This email is already in use. Please use a different email.");
      } else {
        toast.error(error.response?.data?.message || "An error occurred while updating your profile.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (data) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if (!token) {
        toast.error("No token available. Please log in.");
        return;
      }

      if (data.newPassword !== data.confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }

      const payload = {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/updatePassword`,
        payload,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.status) {
        // Fetch updated user data after password change
        const userResponse = await axios.get(
          `${config.baseURL}/v1/api/auth/getUserById/${auth.user._id}`,
          { headers: { Authorization: `${token}` } }
        );

        if (userResponse.data.status) {
          // Update Redux state with new user data
          dispatch(setUser(userResponse.data.items));
          dispatch(setEmail(userResponse.data.items.email));
          
          // If billing details are included in the response, update them too
          if (userResponse.data.items?.BillingDetails?.length > 0) {
            dispatch(updateBillingDetails(userResponse.data.items.BillingDetails[0]));
          }
        }

        toast.success("Your password has been reset successfully!");
        reset();
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "An error occurred while resetting your password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
            <Input 
              {...register("name")} 
              type="text"
              disabled={true}
              className="bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">Username is automatically generated from your email</p>
          </div>

          <div>
            <Label>Email</Label>
            <Input 
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })} 
              type="email"
              disabled={isUpdating}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <h2 className="text-lg font-semibold mt-4">Change Password</h2>

          <div className="relative">
            <Label>Current Password</Label>
            <Input 
              {...register("currentPassword")} 
              type={showPassword ? "text" : "password"}
              disabled={isUpdating}
            />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="relative">
            <Label>New Password</Label>
            <Input 
              {...register("newPassword")} 
              type={showNewPassword ? "text" : "password"}
              disabled={isUpdating}
            />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="relative">
            <Label>Confirm Password</Label>
            <Input 
              {...register("confirmPassword")} 
              type={showNewPassword ? "text" : "password"}
              disabled={isUpdating}
            />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit(handleResetPassword)}
              disabled={isUpdating}
            >
              {isUpdating ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}