'use strict';

/**
 * Safely extracts client IP address from Express request.
 * Checks standard proxy headers and socket connections with fallback.
 * @param {import('express').Request} req
 * @returns {string} Client IP address (e.g. "127.0.0.1")
 */
function getClientIp(req) {
  if (!req) return '127.0.0.1';

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const clientIp = ips.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    const clientIp = Array.isArray(realIp) ? realIp[0] : realIp;
    if (clientIp) return clientIp.trim();
  }

  const socketIp = req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (socketIp) {
    // Normalise IPv6 loopback
    if (socketIp === '::1' || socketIp === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return socketIp;
  }

  return req.ip || '127.0.0.1';
}

/**
 * Extracts and sanitises the User-Agent header from an Express request.
 * @param {import('express').Request} req
 * @returns {string|null} Sanitised User-Agent string capped at 255 chars
 */
function getUserAgent(req) {
  if (!req || !req.headers) return null;
  const ua = req.headers['user-agent'] || null;
  if (!ua) return null;
  return String(ua).slice(0, 255);
}

module.exports = {
  getClientIp,
  getUserAgent,
};
