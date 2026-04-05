import AuditLog from "../models/auditLog.model.js";

export async function logRecordAudit({ actorId, action, recordId, summary }) {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      recordId,
      summary: String(summary).slice(0, 500),
    });
  } catch (err) {
    console.error("[audit] failed to write log", err.message);
  }
}
