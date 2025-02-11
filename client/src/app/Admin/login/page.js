"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setToken, setEmail, setUser } from "@/redux/authSlice";
import config from "@/app/config_BASE_URL";
import { Loader2 } from "lucide-react"; // Import a spinner icon (e.g., from lucide-react)

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Set loading to true when login starts
    setLoading(true);

    try {
      // Step 1: Call the login API
      const loginResponse = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email: username,
        password,
      });

      const { items } = loginResponse.data;
      const { token, user } = items;

      if (token && user) {
        // Store the token in Redux
        dispatch(setToken(token));

        // Step 2: Call the verify API
        const verifyResponse = await axios.post(`${config.baseURL}/v1/api/auth/verify/${token}`);

        if (verifyResponse.data.status && verifyResponse.data.items.role === "ADMIN") {
          // Store user details in Redux
          dispatch(setUser(user));
          dispatch(setEmail(user.email));

          // Show success message
          toast.success("Login successful!");

          // Redirect to admin dashboard
          router.push("/Admin/Admin-dashboard");
        } else {
          // Show error message if user is not an admin
          toast.error("You are not authorized as an admin.");
        }
      } else {
        // Show error message if login fails
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Invalid credentials or server error.");
    } finally {
      // Set loading to false when login process ends
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Add Toaster for displaying notifications */}
      <Toaster position="top-right" />

      <Card className="w-96">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="btn w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}