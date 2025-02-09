// redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  _id: null,
  success: null,
  superAdminDetails: null,
  items: {
    passwordResetToken: null, // Add this field
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
      state.items.passwordResetToken = action.payload; // Add this reducer
    },
    clearPasswordResetToken: (state) => {
      state.items.passwordResetToken = null; // Clear the token when needed
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
} = authSlice.actions;

export default authSlice.reducer;