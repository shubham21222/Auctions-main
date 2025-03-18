import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";

const initialState = {
    token: null,
    user: null, // Will store user object including Payment_Status, encrypted walletBalance, and billing details
    _id: null,
    success: null,
    superAdminDetails: null,
    isLoggedIn: false,
    isBillingDetailsAvailable: false, // New flag for billing details availability
    paymentDetails: null, // Add this to store payment data
    items: {
        email: null,
        passwordResetToken: null,
    },
};

// Encryption key (should be stored securely, e.g., in environment variables)
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "Shubham@9806265682";

// Encrypt function
const encryptValue = (value) => {
    return CryptoJS.AES.encrypt(String(value), ENCRYPTION_KEY).toString();
};

// Decrypt function
const decryptValue = (encryptedValue) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption error:", error);
        return "0"; // Fallback to 0 if decryption fails
    }
};

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
                walletBalance: userData.walletBalance !== undefined ? encryptValue(userData.walletBalance) : encryptValue(0), // Encrypt walletBalance
                BillingDetails: userData.BillingDetails || [], // Store billing details
            };
            state._id = userData._id;
            state.isLoggedIn = true;
            state.isBillingDetailsAvailable = userData.BillingDetails && userData.BillingDetails.length > 0; // Set flag based on availability
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
                state.user.walletBalance = encryptValue(action.payload); // Encrypt the new balance
            }
        },
        updateBillingDetails: (state, action) => {
            if (state.user) {
                state.user.BillingDetails = [action.payload]; // Update billing details (single object assumed)
                state.isBillingDetailsAvailable = true; // Set flag to true when details are updated
            }
        },
        setPaymentDetails(state, action) { // New action
            state.paymentDetails = action.payload;
        },
        clearPaymentDetails(state) { // Optional: Clear after use
            state.paymentDetails = null;
        },
    },
});

// Export actions
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
    setPaymentDetails,
    clearPaymentDetails,
    updateBillingDetails, // New action for updating billing details
} = authSlice.actions;

// Selectors
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;
export const selectUserId = (state) => state.auth._id;
export const selectPaymentStatus = (state) => state.auth.user?.Payment_Status;
export const selectWalletBalance = (state) => {
    if (state.auth.user?.walletBalance) {
        return Number(decryptValue(state.auth.user.walletBalance)); // Decrypt and return as number
    }
    return 0; // Default to 0 if not present
};
export const selectBillingDetails = (state) => state.auth.user?.BillingDetails || [];
export const selectIsBillingDetailsAvailable = (state) => state.auth.isBillingDetailsAvailable;
export const selectPaymentDetails = (state) => state.auth.paymentDetails; // New selector

export default authSlice.reducer;


// // redux/slices/authSlice.js
// import { createSlice } from "@reduxjs/toolkit";
// import CryptoJS from "crypto-js";

// // Encryption key (should ideally be in .env and not exposed client-side)
// const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key-here";

// // Helper functions for encryption and decryption
// const encryptData = (data) => {
//   if (!data) return null;
//   try {
//     return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
//   } catch (error) {
//     console.error("Encryption failed:", error);
//     return data; // Fallback to plain data if encryption fails
//   }
// };

// const decryptData = (encryptedData) => {
//   if (!encryptedData) return null;
//   try {
//     const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//     const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//     return decrypted ? JSON.parse(decrypted) : encryptedData; // Fallback if decryption fails
//   } catch (error) {
//     console.error("Decryption failed:", error);
//     return encryptedData; // Return as-is if decryption fails
//   }
// };

// const initialState = {
//   token: null, // Stored encrypted
//   user: null, // Stored encrypted
//   _id: null, // Stored encrypted
//   success: null, // Not encrypted
//   superAdminDetails: null, // Stored encrypted
//   isLoggedIn: false, // Not encrypted
//   items: {
//     email: null, // Stored encrypted
//     passwordResetToken: null, // Stored encrypted
//   },
// };

// export const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setToken: (state, action) => {
//       state.token = encryptData(action.payload);
//       state.isLoggedIn = true;
//     },
//     removeToken: (state) => {
//       state.token = null;
//       state.isLoggedIn = false;
//     },
//     setUser: (state, action) => {
//       state.user = encryptData(action.payload);
//       state.isLoggedIn = true;
//     },
//     removeUser: (state) => {
//       state.user = null;
//       state.isLoggedIn = false;
//     },
//     setUserId: (state, action) => {
//       state._id = encryptData(action.payload);
//     },
//     setSuccess: (state, action) => {
//       state.success = action.payload;
//     },
//     removeSuccess: (state) => {
//       state.success = null;
//     },
//     setSuperAdminDetails: (state, action) => {
//       state.superAdminDetails = encryptData(action.payload);
//     },
//     setPasswordResetToken: (state, action) => {
//       state.items.passwordResetToken = encryptData(action.payload);
//     },
//     clearPasswordResetToken: (state) => {
//       state.items.passwordResetToken = null;
//     },
//     setEmail: (state, action) => {
//       state.items.email = encryptData(action.payload);
//     },
//     clearEmail: (state) => {
//       state.items.email = null;
//     },
//     setLoggedIn: (state, action) => {
//       state.isLoggedIn = action.payload;
//     },
//   },
// });

// export const {
//   setUserId,
//   setToken,
//   removeToken,
//   setUser,
//   removeUser,
//   setSuccess,
//   removeSuccess,
//   setSuperAdminDetails,
//   setPasswordResetToken,
//   clearPasswordResetToken,
//   setEmail,
//   clearEmail,
//   setLoggedIn,
// } = authSlice.actions;

// // Custom selector to decrypt the entire auth state
// export const selectAuth = (state) => ({
//   token: decryptData(state.auth.token),
//   user: decryptData(state.auth.user),
//   _id: decryptData(state.auth._id),
//   success: state.auth.success, // No decryption needed
//   superAdminDetails: decryptData(state.auth.superAdminDetails),
//   isLoggedIn: state.auth.isLoggedIn, // No decryption needed
//   items: {
//     email: decryptData(state.auth.items.email),
//     passwordResetToken: decryptData(state.auth.items.passwordResetToken),
//   },
// });

// // Individual selectors for convenience
// export const selectToken = (state) => decryptData(state.auth.token);
// export const selectUser = (state) => decryptData(state.auth.user);
// export const selectUserId = (state) => decryptData(state.auth._id);
// export const selectSuccess = (state) => state.auth.success;
// export const selectSuperAdminDetails = (state) => decryptData(state.auth.superAdminDetails);
// export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
// export const selectEmail = (state) => decryptData(state.auth.items.email);
// export const selectPasswordResetToken = (state) => decryptData(state.auth.items.passwordResetToken);

// export default authSlice.reducer;