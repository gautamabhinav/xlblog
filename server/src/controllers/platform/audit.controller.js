import AuditLog from "../../models/platform/auditLog.model.js";

export const writeAuditLog = async ({ req, action, entityType, entityId = "", metadata = {} }) => {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      action,
      entityType,
      entityId: String(entityId || ""),
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
      requestId: req.requestId || "",
      metadata,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") console.warn("Audit log write failed", error.message);
  }
};
