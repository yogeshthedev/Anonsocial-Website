import { User } from "../models/user.models.js";
import { uploadFile } from "../services/storage.service.js";
import ImageKit from "imagekit";
import { Post } from "./../models/post.models.js";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const getMyProfileController = async (req, res) => {
  try {
    const userProfile = req.user;

    if (!userProfile) {
      return res.status(404).json({ message: "User Profile Not exist" });
    }

    const postsCount = await Post.countDocuments({
      authorId: userProfile._id,
      deleted: false,
      visibility: "public",
    });

    return res.status(200).json({
      message: "User Profile fetched successfully",
      user: {
        id: userProfile._id,
        displayName: userProfile.displayName,
        email: userProfile.email,
        username: userProfile.username,
        photoUrl: userProfile.photoUrl,
        bio: userProfile.bio,
        lastSeen: userProfile.lastSeen,
        postsCount: postsCount,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfileController = async (req, res) => {
  const username = req.params.username.toLowerCase().trim();

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({
      message: "User not found",
    });
  }

  res.status(201).json({
    message: "User fetched successfully",
    user: {
      displayName: user.displayName,
      username: user.username,
      photoUrl: user.photoUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
};

export const updateAvatarController = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Avatar image is required" });
    }

    const file = req.file;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Load existing user to get old fileId (if any)
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const oldFileId = existingUser.photoFileId || null;

    // Build a safe filename
    const extension = file.mimetype.split("/")[1] || "jpg";
    const fileName = `avatar_${userId}_${Date.now()}.${extension}`;

    // 1) Upload new image to ImageKit
    const uploadResponse = await uploadFile(file.buffer, fileName);
    if (!uploadResponse || !uploadResponse.fileId || !uploadResponse.url) {
      // if upload didn't return expected fields
      return res.status(500).json({ message: "Image upload failed" });
    }

    // 2) Update DB with new image info
    let updatedUser;
    try {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          photoUrl: uploadResponse.url,
          photoFileId: uploadResponse.fileId,
        },
        { new: true }
      ).select("-password");
    } catch (dbErr) {
      // DB update failed — attempt to rollback (delete newly uploaded image)
      try {
        await imagekit.deleteFile(uploadResponse.fileId);
        console.warn(
          `Rolled back uploaded avatar (deleted new file): ${uploadResponse.fileId}`
        );
      } catch (delErr) {
        console.error(
          "Failed to rollback newly uploaded avatar after DB error:",
          delErr
        );
      }
      console.error("DB update error:", dbErr);
      return res.status(500).json({ message: "Failed to save avatar" });
    }

    // 3) After successful DB update, delete old avatar from ImageKit (if existed)
    if (oldFileId) {
      try {
        // best-effort: log but do not fail the whole request if deletion fails
        await imagekit.deleteFile(oldFileId);
        console.log("Deleted old avatar:", oldFileId);
      } catch (deleteOldErr) {
        console.error("Failed to delete old avatar:", deleteOldErr);
        // do not revert the successful update — just log for later cleanup
      }
    }

    // 4) Return updated user
    return res.status(200).json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Avatar update error:", err);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

export const updateMyProfileController = async (req, res) => {
  try {
    const userId = req.user.id; // set by your auth middleware

    // Pick only allowed fields from the request
    const { displayName, username, bio } = req.body;

    // If none of the allowed fields are present, return error
    if (
      displayName === undefined &&
      username === undefined &&
      bio === undefined
    ) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updates = {}; // we'll put fields to update here

    // Validate displayName if provided
    if (displayName !== undefined) {
      if (typeof displayName !== "string") {
        return res
          .status(400)
          .json({ message: "displayName must be a string" });
      }
      const trimmed = displayName.trim();
      if (trimmed.length === 0 || trimmed.length > 50) {
        return res
          .status(400)
          .json({ message: "displayName must be 1–50 characters" });
      }
      updates.displayName = trimmed;
    }

    // Validate username if provided
    if (username !== undefined) {
      if (typeof username !== "string") {
        return res.status(400).json({ message: "username must be a string" });
      }
      const normalized = username.trim().toLowerCase();

      // simple username rule
      const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;
      if (!USERNAME_REGEX.test(normalized)) {
        return res.status(400).json({
          message:
            "username must be 3–30 characters and contain only lowercase letters, numbers, or underscores",
        });
      }

      // Check uniqueness: find any other user (not this user) with the same username
      const conflict = await User.findOne({
        username: normalized,
        _id: { $ne: userId },
      });
      if (conflict) {
        return res.status(409).json({ message: "Username is already taken" });
      }

      updates.username = normalized;
    }

    // Validate bio if provided
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({ message: "bio must be a string" });
      }
      const trimmed = bio.trim();
      if (trimmed.length > 160) {
        return res
          .status(400)
          .json({ message: "bio must be at most 160 characters" });
      }
      updates.bio = trimmed;
    }

    // If updates object is still empty (shouldn't happen because of earlier check), return
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Perform the update and return the new document (excluding password)
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -photoFileId");

    return res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkUsernameController = async (req, res) => {
  try {
    let { username } = req.params;

    if (!username) {
      return res
        .status(400)
        .json({ available: false, message: "Username is required" });
    }

    username = username.trim().toLowerCase();

    // Validate format
    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        available: false,
        message: "Invalid username format",
      });
    }

    // If user is logged in and checking their own username, allow it
    const currentUserId = req.user?.id; // optional
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId);
      if (currentUser && currentUser.username === username) {
        return res.status(200).json({
          available: true,
          message: "Username unchanged",
        });
      }
    }

    // Check in DB
    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(200).json({
        available: false,
        message: "Username already taken",
      });
    }

    // Available
    return res.status(200).json({
      available: true,
      message: "Username is available",
    });
  } catch (error) {
    console.error("checkUsername error:", error);
    return res.status(500).json({ available: false, message: "Server error" });
  }
};
