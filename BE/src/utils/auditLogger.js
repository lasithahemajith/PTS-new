import AuditLog from "../models/auditLogModel.js";

/**
 * Create an audit log entry. Silently ignores errors so auditing never
 * breaks the main request flow.
 *
 * @param {object} opts
 * @param {string|null} opts.userId
 * @param {string}      opts.userName
 * @param {string}      opts.userRole  - Student | Mentor | Tutor | System
 * @param {string}      opts.action    - e.g. LOGIN, CREATE_LOG, VERIFY_LOG …
 * @param {string|null} opts.resource  - e.g. logpaper, attendance, user
 * @param {string|null} opts.resourceId
 * @param {string|null} opts.details
 * @param {string|null} opts.ipAddress
 */
export const createAuditLog = async ({
  userId = null,
  userName = "Unknown",
  userRole = "System",
  action,
  resource = null,
  resourceId = null,
  details = null,
  ipAddress = null,
}) => {
  try {
    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("⚠️  AuditLog write failed:", err.message);
  }
};
