import express from "express";
import {
  getMe,
  updateMe,
  getUsers,
  updateRole,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  updateRoleSchema,
  updateStatusSchema,
  profileUpdateSchema,
} from "../validation/user.validation.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.patch(
  "/me",
  authMiddleware,
  validateBody(profileUpdateSchema),
  updateMe
);

router.get("/", authMiddleware, authorizeRoles("admin"), getUsers);
router.put(
  "/:id/role",
  authMiddleware,
  authorizeRoles("admin"),
  validateBody(updateRoleSchema),
  updateRole
);
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  validateBody(updateStatusSchema),
  updateUserStatus
);

export default router;
