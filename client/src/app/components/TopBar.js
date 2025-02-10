'use client';
import React, { useState } from "react";
import Link from "next/link";
import GoogleTranslate from "./GoogleTranslate";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken,removeUser } from "@/redux/authSlice";
import config from "../config_BASE_URL";

const TopBar = ({ setShowLoginModal, setShowSignupModal }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Call the logout API with the token
      await axios.post(
        `${config.baseURL}/v1/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Logout successful');
      
      // Clear the authentication state in Redux
      dispatch(removeToken()); // Remove the token
      dispatch(removeUser());  // Remove the user details

      // Optionally, redirect the user to the home page or login page
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred while logging out. Please try again.');
    }
  };

  return (
    <div className="hidden md:block border-b z-50 relative">
      <div className="container mx-auto px-4 h-10 flex items-center justify-between">
        {/* Left Section: Language Selector */}
        <div className="flex items-center gap-2">
          <GoogleTranslate />
        </div>

        {/* Right Section: Links and Buttons */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/exclusive-access" className="hover:text-gray-600">
            EXCLUSIVE ACCESS
          </Link>
          <Link href="/about-us" className="hover:text-gray-600">
            ABOUT
          </Link>
          <Link href="/past-auctions" className="hover:text-gray-600">
            PAST AUCTIONS
          </Link>
          <Link href="/FAQs" className="hover:text-gray-600">
            FAQ
          </Link>

          {auth.token ? (
            <div className="relative">
              {/* Dropdown Trigger */}
              <button
                className="bg-[#002654] hover:bg-[#002654]/90 text-white rounded px-4 py-1 text-sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event propagation
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                MY ACCOUNT ▼
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 w-48 bg-white text-black rounded-lg shadow-lg mt-2 z-50">
                  <div className="flex flex-col space-y-1 p-2">
                    <Link href="/my-account" className="hover:bg-gray-100 px-4 py-2 rounded">
                      Profile
                    </Link>
                    <Link href="/auctions" className="hover:bg-gray-100 px-4 py-2 rounded">
                      Auctions
                    </Link>
                    <Link href="/purchases" className="hover:bg-gray-100 px-4 py-2 rounded">
                      Purchases
                    </Link>
                    <Link href="/seller-portal" className="hover:bg-gray-100 px-4 py-2 rounded">
                      Seller Portal
                    </Link>
                    <button
                      className="hover:bg-gray-100 px-4 py-2 rounded text-left"
                      onClick={handleLogout} // Attach the logout function here
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Login
              </button>

              <button
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setShowSignupModal(true)}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;