import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";

export const createPostController = async (req, res) => {
  try {
    const authUser = req.user;

    let {
      content,
      isAnonymous = false,
      imageUrls = [],
      visibility = "public",
    } = req.body;

    content = content.trim();
    isAnonymous = isAnonymous === true || isAnonymous === "true";
    if (!Array.isArray(imageUrls)) imageUrls = [];

    // Validate: post must have text or image
    if (!content && imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "Post must contain text or image" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: "Content too long" });
    }

    // Validate ImageKit URLs
    const baseURL = process.env.IMAGEKIT_URL_ENDPOINT;
    for (const url of imageUrls) {
      if (typeof url !== "string" || !url.startsWith(baseURL)) {
        return res.status(400).json({ message: "Invalid image URL" });
      }
    }

    // Determine displayNamePublic
    let displayNamePublic = "Anonymous";
    if (!isAnonymous) {
      let displayName = authUser.displayName;
      if (!displayName) {
        const userDoc = await User.findById(authUser.id).select(
          "displayName username"
        );
        displayName = userDoc?.displayName || userDoc?.username || "User";
      }
      displayNamePublic = displayName;
    }

    // Create post
    const post = await Post.create({
      authorId: authUser.id,
      displayNamePublic,
      isAnonymous,
      content,
      imageUrls,
      visibility,
    });

    // Response (do NOT include authorId for anonymous)
    const publicPost = {
      id: post._id,
      displayNamePublic: post.displayNamePublic,
      isAnonymous: post.isAnonymous,
      content: post.content,
      imageUrls: post.imageUrls,
      visibility: post.visibility,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
    };

    return res.status(201).json(publicPost);
  } catch (err) {
    console.error("createPostController error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

