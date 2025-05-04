// UPDATED Auth Slice with fetchUserProfile

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import axios from "axios";
import config from "../app/config_BASE_URL";

const initialState = {
  token: null,
  user: null,
  _id: null,
  success: null,
  superAdminDetails: null,
  isLoggedIn: false,
  isBillingDetailsAvailable: false,
  isPaymentMethodAdded: false,
  isEmailVerified: false,
  paymentDetails: null,
  items: {
    email: null,
    passwordResetToken: null,
  },
  billingDetails: null,
  paymentMethodId: null,
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

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        temp_password: userData.temp_password || "false",
        BillingDetails: userData.BillingDetails || undefined,
      };

      const signupResponse = await axios.post(
        `${config.baseURL}/v1/api/auth/register`,
        payload
      );

      if (!signupResponse.data.success) {
        throw new Error(signupResponse.data.message || "Registration failed.");
      }

      const loginResponse = await axios.post(`${config.baseURL}/v1/api/auth/login`, {
        email: userData.email,
        password: userData.password,
      });

      if (!loginResponse.data.status || !loginResponse.data.items.success) {
        throw new Error(loginResponse.data.message || "Login failed after registration.");
      }

      const token = loginResponse.data.items.token;
      const userDetails = loginResponse.data.items.user;

      return { token, userData: userDetails };
    } catch (err) {
      console.error("Error in registerUser:", err);
      return rejectWithValue(err.message || "An error occurred during registration.");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const verifyResponse = await axios.post(
        `${config.baseURL}/v1/api/auth/verify/${token}`,
        {},
        { headers: { Authorization: token } }
      );

      if (!verifyResponse.data.status) {
        throw new Error(verifyResponse.data.message || "Email verification failed.");
      }

      return verifyResponse.data.items;
    } catch (err) {
      console.error("Error in verifyEmail:", err);
      return rejectWithValue(err.message || "An error occurred during email verification.");
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(config.baseURL + "/v1/api/auth/me", {
        headers: { Authorization: token },
      });

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to fetch profile");
      }

      return response.data.items;
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      return rejectWithValue(err.message || "Failed to fetch profile");
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
      state.isPaymentMethodAdded = false;
      state.isEmailVerified = false;
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
      state.isPaymentMethodAdded = !!userData.paymentMethodId;
      state.isEmailVerified = userData.isEmailVerified || false;
    },
    removeUser: (state) => {
      state.user = null;
      state._id = null;
      state.isLoggedIn = false;
      state.isBillingDetailsAvailable = false;
      state.isPaymentMethodAdded = false;
      state.isEmailVerified = false;
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
      state.billingDetails = action.payload;
      state.isBillingDetailsAvailable = !!action.payload;
      if (state.user) {
        state.user.BillingDetails = action.payload ? [action.payload] : [];
      }
    },
    setPaymentDetails: (state, action) => {
      state.paymentDetails = action.payload;
    },
    clearPaymentDetails: (state) => {
      state.paymentDetails = null;
    },
    updatePaymentMethod: (state, action) => {
      state.paymentMethodId = action.payload;
      state.isPaymentMethodAdded = !!action.payload;
      if (state.user) {
        state.user.paymentMethodId = action.payload;
      }
    },
    setEmailVerified: (state, action) => {
      state.isEmailVerified = action.payload;
      if (state.user) {
        state.user.isEmailVerified = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, userData } = action.payload;
        state.token = token;
        state.user = {
          ...userData,
          walletBalance: userData.walletBalance !== undefined ? encryptValue(userData.walletBalance) : encryptValue(0),
          BillingDetails: userData.BillingDetails || [],
        };
        state._id = userData._id || null;
        state.items.email = userData.email || null;
        state.isLoggedIn = true;
        state.billingDetails = userData.BillingDetails?.[0] || null;
        state.paymentMethodId = userData.paymentMethodId || null;
        state.isPaymentMethodAdded = !!userData.paymentMethodId;
        state.isEmailVerified = userData.isEmailVerified || false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.error("Registration failed:", action.payload);
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        const verifiedUserData = action.payload;
        state.user = {
          ...verifiedUserData,
          walletBalance: verifiedUserData.walletBalance !== undefined ? encryptValue(verifiedUserData.walletBalance) : encryptValue(0),
          BillingDetails: verifiedUserData.BillingDetails || [],
        };
        state.isEmailVerified = verifiedUserData.isEmailVerified || false;
        state.isBillingDetailsAvailable = verifiedUserData.BillingDetails && verifiedUserData.BillingDetails.length > 0;
        state.billingDetails = verifiedUserData.BillingDetails?.[0] || null;
        state.paymentMethodId = verifiedUserData.paymentMethodId || null;
        state.isPaymentMethodAdded = !!verifiedUserData.paymentMethodId;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        console.error("Email verification failed:", action.payload);
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        const userData = action.payload;
        state.user = {
          ...userData,
          walletBalance: userData.walletBalance !== undefined ? encryptValue(userData.walletBalance) : encryptValue(0),
          BillingDetails: userData.BillingDetails || [],
        };
        state._id = userData._id || null;
        state.billingDetails = userData.BillingDetails?.[0] || null;
        state.paymentMethodId = userData.paymentMethodId || null;
        state.isPaymentMethodAdded = !!userData.paymentMethodId;
        state.isEmailVerified = userData.isEmailVerified || false;
        state.isBillingDetailsAvailable = userData.BillingDetails && userData.BillingDetails.length > 0;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        console.error("Fetch profile failed:", action.payload);
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
  updatePaymentMethod,
  setEmailVerified,
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
export const selectIsPaymentMethodAdded = (state) => state.auth.isPaymentMethodAdded;
export const selectIsEmailVerified = (state) => state.auth.isEmailVerified;

export default authSlice.reducer;