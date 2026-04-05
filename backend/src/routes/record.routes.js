import express from "express";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
  restoreRecord,
} from "../controllers/record.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  recordCreateSchema,
  recordUpdateSchema,
} from "../validation/record.validation.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("viewer", "analyst", "admin"),
  getRecords
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  validateBody(recordCreateSchema),
  createRecord
);

router.patch(
  "/:id/restore",
  authMiddleware,
  authorizeRoles("admin"),
  restoreRecord
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  validateBody(recordUpdateSchema),
  updateRecord
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteRecord
);

export default router;
