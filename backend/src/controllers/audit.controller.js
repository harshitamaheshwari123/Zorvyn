import AuditLog from "../models/auditLog.model.js";

export const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const data = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actor", "name email role")
      .lean();

    res.json({ data, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading activity log" });
  }
};
