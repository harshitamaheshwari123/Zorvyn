import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("viewer", "analyst", "admin"),
  getAuditLogs
);

export default router;
