import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice"; // Import your reducer

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
};

// Combine reducers (if you have multiple reducers)
const rootReducer = combineReducers({
  auth: authReducer, // Add your reducers here
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
