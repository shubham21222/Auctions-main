// redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    user: null,
    _id: null,
    success: null,
    superAdminDetails: null,
    isLoggedIn: false, // Add isLoggedIn field, default to false
    items: {
        email: null,
        passwordResetToken: null,
    },
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isLoggedIn = true; // Set isLoggedIn to true when token is set
        },
        removeToken: (state) => {
            state.token = null;
            state.isLoggedIn = false; // Set isLoggedIn to false when token is removed
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true; // Set isLoggedIn to true when user is set
        },
        removeUser: (state) => {
            state.user = null;
            state.isLoggedIn = false; // Set isLoggedIn to false when user is removed
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
} = authSlice.actions;

// Selector to access isLoggedIn from the Redux state
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

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