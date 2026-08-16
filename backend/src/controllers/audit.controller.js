'use strict';

const auditService = require('../services/audit.service');
const { success, paginated } = require('../utils/response');

/**
 * GET /api/admin/audit-logs
 * Paginated and filterable endpoint for retrieving audit trail records.
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      search,
      action,
      entityType,
      userId,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const result = await auditService.listAuditLogs({
      search,
      action,
      entityType,
      userId,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return paginated(res, result, 'Audit logs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/audit-logs/stats
 * Summary statistics for the audit trail dashboard header.
 */
const getAuditStats = async (req, res, next) => {
  try {
    const stats = await auditService.getAuditStats();
    return success(res, stats, 'Audit trail statistics retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
  getAuditStats,
};
