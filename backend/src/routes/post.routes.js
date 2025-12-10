import { Router } from "express";
import { authUserMiddleware } from "../middleware/auth.middleware.js";
import { createPostController } from "../controllers/post.controller.js";
const router = Router();

router.post("/posts", authUserMiddleware, createPostController);

// router.get("/posts/:id", getSinglePostController);
// router.delete("/posts/:id", authUserMiddleware, deletePostController);
// router.post("/posts/:id/like", authUserMiddleware, toggleLikePostController);
// router.post("/posts/:id/comments", authUserMiddleware, createCommentController);
// router.get("/posts/:id/comments", getPostCommentsController);

export default router;
