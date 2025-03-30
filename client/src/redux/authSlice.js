import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import axios from "axios";
import config from "../app/config_BASE_URL"; // Adjust path as needed

const initialState = {
  token: null,
  user: null,
  _id: null,
  success: null,
  superAdminDetails: null,
  isLoggedIn: false,
  isBillingDetailsAvailable: false,
  paymentDetails: null,
  items: {
    email: null,
    passwordResetToken: null,
  },
};

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "Shubham@9806265682";

const encryptValue = (value) => {
  return CryptoJS.AES.encrypt(String(value), ENCRYPTION_KEY).toString();
};

const decryptValue = (encryptedValue) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "0";
  }
};

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password, name, billingDetails }, { rejectWithValue }) => {
    try {
      const signupResponse = await axios.post(`${config.baseURL}/v1/api/auth/register`, {
        email,
        password,
        name,
        BillingDetails: Object.values(billingDetails).some(value => value) ? [billingDetails] : [],
      });

      if (!signupResponse.data.success) {
        throw new Error(signupResponse.data.message || "Registration failed.");
      }

      const loginResponse = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email,
        password,
      });

      if (!loginResponse.data.status || !loginResponse.data.items.success) {
        throw new Error(loginResponse.data.message || "Login failed after registration.");
      }

      const token = loginResponse.data.items.token;
      const userData = loginResponse.data.items.user;

      if (!token || !userData) {
        throw new Error("No token or user data received from login response.");
      }

      const verifyResponse = await axios.post(
        `${config.baseURL}/v1/api/auth/verify/${token}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { token, userData, verifyResponse: verifyResponse.data }; // Return data to be handled by reducers
    } catch (err) {
      return rejectWithValue(err.message || "An error occurred during registration.");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isLoggedIn = true;
    },
    removeToken: (state) => {
      state.token = null;
      state.isLoggedIn = false;
    },
    setUser: (state, action) => {
      const userData = action.payload;
      state.user = {
        ...userData,
        walletBalance: userData.walletBalance !== undefined ? encryptValue(userData.walletBalance) : encryptValue(0),
        BillingDetails: userData.BillingDetails || [],
      };
      state._id = userData._id;
      state.isLoggedIn = true;
      state.isBillingDetailsAvailable = userData.BillingDetails && userData.BillingDetails.length > 0;
    },
    removeUser: (state) => {
      state.user = null;
      state._id = null;
      state.isLoggedIn = false;
      state.isBillingDetailsAvailable = false;
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
      state.items.passwordResetToken = action.payload;
    },
    clearPasswordResetToken: (state) => {
      state.items.passwordResetToken = null;
    },
    setEmail: (state, action) => {
      state.items.email = action.payload;
    },
    clearEmail: (state) => {
      state.items.email = null;
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    updatePaymentStatus: (state, action) => {
      if (state.user) {
        state.user.Payment_Status = action.payload;
      }
    },
    updateWalletBalance: (state, action) => {
      if (state.user) {
        state.user.walletBalance = encryptValue(action.payload);
      }
    },
    updateBillingDetails: (state, action) => {
      if (state.user) {
        state.user.BillingDetails = [action.payload];
        state.isBillingDetailsAvailable = true;
      }
    },
    setPaymentDetails: (state, action) => {
      state.paymentDetails = action.payload;
    },
    clearPaymentDetails: (state) => {
      state.paymentDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, userData, verifyResponse } = action.payload;
        state.token = token;
        state.user = {
          ...userData,
          walletBalance: userData.walletBalance !== undefined ? encryptValue(userData.walletBalance) : encryptValue(0),
          BillingDetails: userData.BillingDetails || [],
        };
        state._id = userData._id || null;
        state.items.email = userData.email || null;
        state.isLoggedIn = true;

        if (verifyResponse?.items && typeof verifyResponse.items === "object") {
          const verifiedUserData = verifyResponse.items;
          state.user = {
            ...verifiedUserData,
            walletBalance: verifiedUserData.walletBalance !== undefined ? encryptValue(verifiedUserData.walletBalance) : encryptValue(0),
            BillingDetails: verifiedUserData.BillingDetails || [],
          };
          state.isBillingDetailsAvailable = verifiedUserData.BillingDetails && verifiedUserData.BillingDetails.length > 0;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.error("Registration failed:", action.payload);
      });
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
  setEmail,
  clearEmail,
  setLoggedIn,
  updatePaymentStatus,
  updateWalletBalance,
  updateBillingDetails,
  setPaymentDetails,
  clearPaymentDetails,
} = authSlice.actions;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;
export const selectUserId = (state) => state.auth._id;
export const selectPaymentStatus = (state) => state.auth.user?.Payment_Status;
export const selectWalletBalance = (state) => {
  if (state.auth.user?.walletBalance) {
    return Number(decryptValue(state.auth.user.walletBalance));
  }
  return 0;
};
export const selectBillingDetails = (state) => state.auth.user?.BillingDetails || [];
export const selectIsBillingDetailsAvailable = (state) => state.auth.isBillingDetailsAvailable;
export const selectPaymentDetails = (state) => state.auth.paymentDetails;

export default authSlice.reducer;