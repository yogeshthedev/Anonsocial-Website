// authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "./authThunks.js";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // put synchronous reducers here if needed
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user ?? action.payload;
        state.success = "Registration successful!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.success = null;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user ?? action.payload;
        state.success = "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.success = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
