// src/features/user/userThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// 1️⃣ Fetch my own profile
export const fetchMyProfile = createAsyncThunk(
  "user/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/me", { withCredentials: true });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load profile");
    }
  }
);

// --- ADD THIS: fetch another user's profile by username ---
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (username, { rejectWithValue }) => {
    try {
      // adjust endpoint to match your backend route (/users/:username is common)
      const res = await axios.get(`/users/${encodeURIComponent(username)}`, {
        withCredentials: true,
      });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load user profile");
    }
  }
);

// 3️⃣ Update my profile (displayName, username, bio)
export const updateMyProfile = createAsyncThunk(
  "user/updateMyProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.put("/me", formData, {
        withCredentials: true,
      });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// 4️⃣ Update avatar
export const updateAvatar = createAsyncThunk(
  "user/updateAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await axios.put("/me/avatar", form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.user;
    } catch (err) {
      return rejectWithValue("Avatar update failed");
    }
  }
);
