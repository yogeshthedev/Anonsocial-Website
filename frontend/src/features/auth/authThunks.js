// authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ displayName, username, email, password }, thunkAPI) => {
    try {
      const res = await api.post(
        "/register",
        { displayName, username, email, password },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Registration failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await api.post(
        "/login",
        { email, password },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
