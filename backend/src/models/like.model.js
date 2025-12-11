import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes: one like per user per post
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model("Like", LikeSchema);
