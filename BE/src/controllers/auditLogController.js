import AuditLog from "../models/auditLogModel.js";

/**
 * GET /audit
 * Tutor-only endpoint. Returns paginated audit logs with optional filters.
 *
 * Query params:
 *   role       – Student | Mentor | Tutor
 *   action     – e.g. LOGIN, CREATE_LOG …
 *   search     – partial match on userName
 *   startDate  – ISO date string (inclusive)
 *   endDate    – ISO date string (inclusive)
 *   page       – page number (default 1)
 *   limit      – items per page (default 20, max 100)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      role,
      action,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (role) filter.userRole = role;
    if (action) filter.action = action;
    if (search) filter.userName = { $regex: search, $options: "i" };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("❌ getAuditLogs error:", err);
    res.status(500).json({ error: err.message });
  }
};
