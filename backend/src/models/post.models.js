import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    displayNamePublic: {
      type: String,
      required: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    imageUrls: {
      type: [String],
      default: [],
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model("Post", PostSchema);
