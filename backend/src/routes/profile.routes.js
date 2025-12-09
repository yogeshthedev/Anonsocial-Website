import { Router } from "express";
import { authUserMiddleware } from "../middleware/auth.middleware.js";
import {
  getMyProfileController,
  getUserProfileController,
  updateAvatarController,
  updateMyProfileController,
} from "../controllers/profile.controller.js";

const router = Router();

router.get("/me", authUserMiddleware, getMyProfileController); //done
router.put("/me", authUserMiddleware, updateMyProfileController);

router.put("/me/avatar", authUserMiddleware, updateAvatarController);

router.get("/users/:username", getUserProfileController); //done

export default router;
