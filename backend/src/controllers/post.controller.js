import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

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

export const getSinglePostController = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post || post.deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

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
      updatedAt: post.updatedAt,
    };

    return res.status(200).json(publicPost);
  } catch (err) {
    console.error("getSinglePostController error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const postId = req.params.id;

    // 1) basic validation of id format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    // 2) find post by id
    const post = await Post.findById(postId);
    if (!post || post.deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 3) ensure user is authenticated (defensive)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // 4) owner check — compare ObjectId to string safely
    if (post.authorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this post" });
    }

    // 5) soft delete and persist
    post.deleted = true;
    await post.save();

    // 6) respond
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("deletePostController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleLikePostController = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const postId = req.params.id;
    const userId = user._id || user.id;

    const post = await Post.findById(postId);

    if (!post || post.deleted === true) {
      return res.status(404).json({
        message: "Post does not exist or has been deleted",
      });
    }

    // STEP 1: Check if user already liked this post
    const existingLike = await Like.findOne({ postId, userId });

    // ================================
    // CASE A: User already liked → UNLIKE
    // ================================
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });

      // decrement likesCount
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      return res.status(200).json({
        liked: false,
        likesCount: post.likesCount,
        message: "Post unliked",
      });
    }

    // ================================
    // CASE B: User has NOT liked → LIKE
    // ================================
    await Like.create({ postId, userId });

    post.likesCount += 1;
    await post.save();

    return res.status(200).json({
      liked: true,
      likesCount: post.likesCount,
      message: "Post liked",
    });
  } catch (error) {
    console.error("toggleLikePostController error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createCommentController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || (!user.id && !user._id)) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = user._id || user.id;

    const postId = req.params.id;
    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    const post = await Post.findById(postId);
    if (!post || post.deleted === true) {
      return res
        .status(404)
        .json({ message: "Post does not exist or has been deleted" });
    }

    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    const MAX_COMMENT_LENGTH = 1000;
    if (content.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({
        message: `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters`,
      });
    }

    const createdComment = await Comment.create({
      postId,
      userId,
      content,
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    return res.status(201).json({
      id: createdComment._id,
      postId: createdComment.postId,
      userId: createdComment.userId,
      content: createdComment.content,
      createdAt: createdComment.createdAt,
    });
  } catch (err) {
    console.error("createCommentController error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostCommentsController = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post || post.deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .select("content userId createdAt");

    res.status(200).json({
      message: "Comments fetched successfully",
      comments: comments,
    });
  } catch (error) {
    console.error("getPostCommentsController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    const user = req.user;

    if (!user || (!user.id && !user._id)) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const postId = req.params.id;
    const commentId = req.query.commentId;

    const post = await Post.findById(postId);

    if (!post || post.deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.findOne({ _id: commentId, postId });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const currentUserId = req.user._id;
    const commentAuthorId = comment.userId;
    const postOwnerId = post.authorId;

    if (
      currentUserId.toString() !== commentAuthorId.toString() &&
      currentUserId.toString() !== postOwnerId.toString()
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment",
      });
    }

    await Comment.deleteOne({ _id: commentId });

    post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
    await post.save();
    return res.status(200).json({
      message: "Comment deleted successfully",
      deletedBy:
        currentUserId.toString() === commentAuthorId
          ? "commentAuthor"
          : "postOwner",
    });
  } catch (error) {
    console.error("deleteCommentController error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
