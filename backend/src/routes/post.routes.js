import { Router } from "express";
import { authUserMiddleware } from "../middleware/auth.middleware.js";
import { createPostController } from "../controllers/post.controller.js";
const router = Router();

router.post("/posts", authUserMiddleware, createPostController);

export default router;
