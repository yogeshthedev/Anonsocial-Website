import { Router } from "express";
import { authUserMiddleware } from "../middleware/auth.middleware.js";
import {
  getMyProfileController,
  getUserProfileController,
  updateAvatarController,
  updateMyProfileController,
} from "../controllers/profile.controller.js";

import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Invalid file type")); // handle this in error middleware
    } else {
      cb(null, true);
    }
  },
});

const router = Router();

router.get("/me", authUserMiddleware, getMyProfileController); //done
router.put("/me", authUserMiddleware, updateMyProfileController);

router.put(
  "/me/avatar",
  authUserMiddleware,
  upload.single("image"),
  updateAvatarController
);

router.get("/users/:username", getUserProfileController); //done

export default router;
