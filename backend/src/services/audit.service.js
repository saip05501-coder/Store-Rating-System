'use strict';

const { pool } = require('../config/db');
const { PAGINATION } = require('../utils/constants');

/**
 * Strips sensitive keys from details objects before logging.
 */
function sanitizeDetails(details) {
  if (!details) return null;
  try {
    const clone = JSON.parse(JSON.stringify(details));
    const sensitiveKeys = [
      'password',
      'newPassword',
      'currentPassword',
      'confirmPassword',
      'adminSecretCode',
      'ownerInviteCode',
      'token',
      'secret',
      'authorization',
    ];

    const redact = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          redact(obj[key]);
        }
      }
    };

    redact(clone);
    return JSON.stringify(clone);
  } catch (_e) {
    return null;
  }
}

/**
 * Record an audit log entry in MySQL.
 * Designed to be append-only and fail-safe (errors are logged to console without breaking primary business operations).
 *
 * @param {Object} params
 * @param {number|null} [params.userId] - ID of actor (from verified JWT or null for unauthenticated events)
 * @param {string} params.action - Action identifier (e.g. 'USER_CREATED', 'STORE_DELETED', 'ADMIN_LOGIN_SUCCESS')
 * @param {string} params.entityType - Entity classification (e.g. 'USER', 'STORE', 'RATING', 'AUTH')
 * @param {number|null} [params.entityId] - ID of the affected record
 * @param {string} params.description - Human-readable summary of the action
 * @param {string|null} [params.ipAddress] - Originating IP address
 * @param {string|null} [params.userAgent] - Client browser / user agent string
 * @param {'SUCCESS'|'FAILED'} [params.status='SUCCESS'] - Status of the action
 * @param {Object|null} [params.details] - Context metadata (will be sanitized)
 * @returns {Promise<Object|null>} Inserted audit log entry
 */
const recordAuditLog = async ({
  userId = null,
  action,
  entityType,
  entityId = null,
  description,
  ipAddress = null,
  userAgent = null,
  status = 'SUCCESS',
  details = null,
}) => {
  try {
    const sanitizedAction = String(action || 'UNKNOWN_ACTION').toUpperCase().trim().slice(0, 60);
    const sanitizedEntityType = String(entityType || 'SYSTEM').toUpperCase().trim().slice(0, 40);
    const sanitizedDesc = String(description || '').trim().slice(0, 500);
    const sanitizedIp = ipAddress ? String(ipAddress).slice(0, 45) : null;
    const sanitizedUa = userAgent ? String(userAgent).slice(0, 255) : null;
    const finalStatus = status === 'FAILED' ? 'FAILED' : 'SUCCESS';
    const jsonDetails = sanitizeDetails(details);

    const [result] = await pool.query(
      `INSERT INTO audit_logs 
        (user_id, action, entity_type, entity_id, description, ip_address, user_agent, status, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        sanitizedAction,
        sanitizedEntityType,
        entityId || null,
        sanitizedDesc,
        sanitizedIp,
        sanitizedUa,
        finalStatus,
        jsonDetails,
      ]
    );

    return {
      id: result.insertId,
      user_id: userId,
      action: sanitizedAction,
      entity_type: sanitizedEntityType,
      entity_id: entityId,
      description: sanitizedDesc,
      ip_address: sanitizedIp,
      status: finalStatus,
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    // Non-blocking: record error in console without throwing to caller
    console.error('⚠️ Failed to write audit log record:', err.message);
    return null;
  }
};

/**
 * List audit logs with comprehensive filters, search, sorting, and pagination.
 *
 * @param {Object} options
 * @param {string} [options.search] - Free-text search matching description, action, actor name/email, entity_id
 * @param {string} [options.action] - Exact action filter
 * @param {string} [options.entityType] - Exact entity type filter
 * @param {number} [options.userId] - Filter by actor ID
 * @param {'SUCCESS'|'FAILED'} [options.status] - Filter by status
 * @param {string} [options.startDate] - ISO / YYYY-MM-DD start datetime
 * @param {string} [options.endDate] - ISO / YYYY-MM-DD end datetime
 * @param {string} [options.sortBy='created_at'] - Allowed sort column
 * @param {string} [options.sortOrder='DESC'] - Sort direction (ASC or DESC)
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Page size limit
 * @returns {Promise<{rows: Array, total: number, page: number, limit: number}>}
 */
const listAuditLogs = async ({
  search = '',
  action = '',
  entityType = '',
  userId = '',
  status = '',
  startDate = '',
  endDate = '',
  sortBy = 'created_at',
  sortOrder = 'DESC',
  page = 1,
  limit = 20,
}) => {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  let where = 'WHERE 1=1';
  const params = [];

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    where += ` AND (
      a.description LIKE ? 
      OR a.action LIKE ? 
      OR a.entity_type LIKE ? 
      OR u.name LIKE ? 
      OR u.email LIKE ? 
      OR CAST(a.entity_id AS CHAR) LIKE ?
      OR a.ip_address LIKE ?
    )`;
    params.push(s, s, s, s, s, s, s);
  }

  if (action && action.trim()) {
    where += ' AND a.action = ?';
    params.push(action.trim().toUpperCase());
  }

  if (entityType && entityType.trim()) {
    where += ' AND a.entity_type = ?';
    params.push(entityType.trim().toUpperCase());
  }

  if (userId) {
    const uid = parseInt(userId, 10);
    if (!isNaN(uid)) {
      where += ' AND a.user_id = ?';
      params.push(uid);
    }
  }

  if (status && ['SUCCESS', 'FAILED'].includes(status.toUpperCase())) {
    where += ' AND a.status = ?';
    params.push(status.toUpperCase());
  }

  if (startDate && startDate.trim()) {
    where += ' AND a.created_at >= ?';
    params.push(new Date(startDate.trim()));
  }

  if (endDate && endDate.trim()) {
    where += ' AND a.created_at <= ?';
    // Append end of day time if date only
    const endStr = endDate.trim().length === 10 ? `${endDate.trim()} 23:59:59` : endDate.trim();
    params.push(new Date(endStr));
  }

  // Sorting whitelist
  const allowedSortFields = {
    id: 'a.id',
    created_at: 'a.created_at',
    action: 'a.action',
    entity_type: 'a.entity_type',
    status: 'a.status',
    user_id: 'a.user_id',
  };

  const sortColumn = allowedSortFields[sortBy] || 'a.created_at';
  const order = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Count total matching records
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total 
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${where}`,
    params
  );
  const total = countRows[0].total;

  // Retrieve paginated records with actor join
  const query = `
    SELECT 
      a.id,
      a.user_id,
      a.action,
      a.entity_type,
      a.entity_id,
      a.description,
      a.ip_address,
      a.user_agent,
      a.status,
      a.details,
      a.created_at,
      u.name AS actor_name,
      u.email AS actor_email,
      u.role AS actor_role
    FROM audit_logs a
    LEFT JOIN users u ON u.id = a.user_id
    ${where}
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `;

  const [rawRows] = await pool.query(query, [...params, l, offset]);

  // Format into consistent standard envelope
  const rows = rawRows.map((r) => {
    let parsedDetails = null;
    if (r.details) {
      try {
        parsedDetails = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
      } catch (_e) {
        parsedDetails = r.details;
      }
    }

    return {
      id: r.id,
      actor: r.user_id
        ? {
            id: r.user_id,
            name: r.actor_name || 'Deleted User',
            email: r.actor_email || 'N/A',
            role: r.actor_role || 'user',
          }
        : {
            id: null,
            name: 'System / Guest',
            email: 'system@storerating.com',
            role: 'system',
          },
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      description: r.description,
      ipAddress: r.ip_address || '127.0.0.1',
      userAgent: r.user_agent,
      status: r.status,
      details: parsedDetails,
      createdAt: r.created_at,
    };
  });

  return { rows, total, page: p, limit: l };
};

/**
 * Retrieve high-level audit trail KPIs for dashboard view.
 */
const getAuditStats = async () => {
  try {
    const [[totalCount]] = await pool.query('SELECT COUNT(*) AS total FROM audit_logs');
    const [[todayCount]] = await pool.query(
      'SELECT COUNT(*) AS total FROM audit_logs WHERE created_at >= CURDATE()'
    );
    const [[failedCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM audit_logs WHERE status = 'FAILED'"
    );
    const [actionBreakdown] = await pool.query(
      'SELECT action, COUNT(*) AS count FROM audit_logs GROUP BY action ORDER BY count DESC LIMIT 6'
    );

    return {
      totalEvents: totalCount.total || 0,
      todayEvents: todayCount.total || 0,
      failedEvents: failedCount.total || 0,
      topActions: actionBreakdown || [],
    };
  } catch (err) {
    console.error('Error fetching audit statistics:', err.message);
    return {
      totalEvents: 0,
      todayEvents: 0,
      failedEvents: 0,
      topActions: [],
    };
  }
};

module.exports = {
  recordAuditLog,
  listAuditLogs,
  getAuditStats,
};
