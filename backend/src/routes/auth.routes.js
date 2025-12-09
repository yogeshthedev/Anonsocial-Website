import { Router } from "express";
import {
  userLoginController,
  userLogoutController,
  userRegisterController,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", userRegisterController);
router.post("/login", userLoginController);
router.get("/logout", userLogoutController);

export default router;
