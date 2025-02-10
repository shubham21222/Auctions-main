"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import usePasswordReset from "@/hooks/usePasswordReset";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";

export default function EditProfileModal({ defaultValues, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues });
  const { resetToken } = usePasswordReset(); // Fetch reset token from the hook
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  // Handle password reset
  const handleResetPassword = async (data) => {
    try {
      if (!resetToken) {
        toast.error("No reset token available. Please verify your account first.");
        return;
      }
      // Format the payload as { password: newPassword }
      const payload = {
        password: data.newPassword, // Use "password" instead of "newPassword"
      };

      const response = await axios.post(
        `${config.baseURL}/v1/api/auth/resetPassword/${resetToken}`,
        payload, // Send the formatted payload
        { headers: { Authorization: `${token}` } }
      );

      console.log("Password reset successful:", response.data);
      toast.success("Your password has been reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error.response?.data || error.message);
      toast.error("An error occurred while resetting your password. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} required />
          </div>

          <div>
            <Label>Email</Label>
            <Input {...register("email")} type="email" required />
          </div>

          <div>
            <Label>Mobile Number</Label>
            <Input {...register("mobile")} type="tel" />
          </div>

          <h2 className="text-lg font-semibold mt-4">Password Change</h2>

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