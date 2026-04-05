import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validation/auth.validation.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  register
);
router.post("/login", loginLimiter, login);

export default router;
