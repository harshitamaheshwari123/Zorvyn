import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import recordRoutes from "./routes/record.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

// Trust proxy (for Render / deployment)
if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Zorvyn API is running");
});


// ==============================
// 🔥 FRONTEND SERVING (IMPORTANT)
// ==============================

// Serve static files from React build (Vite -> dist)
app.use(express.static(path.join(process.cwd(), "dist")));

// Handle React routing (fix for refresh issue)
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});


// ==============================
// ❗ ERROR HANDLER (keep last)
// ==============================
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

export default app;