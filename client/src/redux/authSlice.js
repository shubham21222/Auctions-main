// redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  _id: null,
  success: null,
  superAdminDetails: null,
  items: {
    email: null, // Add this field for storing the email
    passwordResetToken: null,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    removeToken: (state) => {
      state.token = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    removeUser: (state) => {
      state.user = null;
    },
    setUserId: (state, action) => {
      state._id = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload; 
    },
    removeSuccess: (state) => {
      state.success = null;
    },
    setSuperAdminDetails: (state, action) => {
      state.superAdminDetails = action.payload;
    },
    setPasswordResetToken: (state, action) => {
      state.items.passwordResetToken = action.payload; // Set password reset token
    },
    clearPasswordResetToken: (state) => {
      state.items.passwordResetToken = null; // Clear password reset token
    },
    setEmail: (state, action) => {
      state.items.email = action.payload; // Add this reducer to set the email
    },
    clearEmail: (state) => {
      state.items.email = null; // Add this reducer to clear the email
    },
  },
});

export const {
  setUserId,
  setToken,
  removeToken,
  setUser,
  removeUser,
  setSuccess,
  removeSuccess,
  setSuperAdminDetails,
  setPasswordResetToken,
  clearPasswordResetToken,
  setEmail, // Export the setEmail action
  clearEmail, // Export the clearEmail action
} = authSlice.actions;

export default authSlice.reducer;