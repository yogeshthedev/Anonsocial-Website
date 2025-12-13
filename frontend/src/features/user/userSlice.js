// src/features/user/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyProfile,
  fetchUserProfile,
  updateMyProfile,
  updateAvatar,
  checkUsername,
} from "./userThunks";

const initialState = {
  me: null, // logged-in user's profile
  otherUser: null, // another user’s profile when visiting /user/:username
  loading: false,
  error: null,

  usernameAvailable: null,
  checkingUsername: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ⭐ Fetch my profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.me = null;
        state.error = action.payload;
      })

      // inside extraReducers (builder) in userSlice.js, add after fetchMyProfile handling:

      // ⭐ Fetch another user's profile (visiting /user/:username)
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.otherUser = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.otherUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.otherUser = null;
        state.error = action.payload;
      })

      // ⭐ Update my profile
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ⭐ Update avatar
      .addCase(updateAvatar.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload;
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder

      // USERNAME CHECK
      .addCase(checkUsername.pending, (state) => {
        state.checkingUsername = true;
      })
      .addCase(checkUsername.fulfilled, (state, action) => {
        state.checkingUsername = false;
        state.usernameAvailable = action.payload.available;
      })
      .addCase(checkUsername.rejected, (state) => {
        state.checkingUsername = false;
        state.usernameAvailable = null;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
