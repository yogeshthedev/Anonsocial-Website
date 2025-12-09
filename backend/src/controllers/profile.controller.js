import { User } from "../models/user.models.js";

export const getMyProfileController = async (req, res) => {
  const userProfile = req.user;

  if (!userProfile) {
    return res.status(404).json({
      message: "User Prfile Not exist",
    });
  }

  res.status(201).json({
    message: "User Profile fetched successfully",
    user: {
      id: userProfile._id,
      displayName: userProfile.displayName,
      email: userProfile.email,
      username: userProfile.username,
      photoUrl: userProfile.photoUrl,
      bio: userProfile.bio,
      lastSeen: userProfile.lastSeen,
    },
  });
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

export const updateMyProfileController = async (req, res) => {};

export const updateAvatarController = async (req, res) => {};
