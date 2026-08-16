'use strict';

const userService = require('../services/user.service');
const { success, paginated } = require('../utils/response');
const { recordAuditLog } = require('../services/audit.service');
const { getClientIp, getUserAgent } = require('../utils/requestUtils');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return success(res, user, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, address, currentPassword, newPassword } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user?.id || null;

    const updated = await userService.updateProfile(req.user.id, {
      name,
      address,
      currentPassword,
      newPassword,
    });

    await recordAuditLog({
      userId: actorId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: updated.id,
      description: `User profile updated for: ${updated.name} (${updated.email})`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { userId: updated.id, name: updated.name, email: updated.email },
    });

    return success(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, role, page, limit } = req.query;
    const result = await userService.listUsers({ search, role, page, limit });
    return paginated(res, result, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user?.id || null;

    const user = await userService.createUser(req.body);

    await recordAuditLog({
      userId: actorId,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: user.id,
      description: `Administrator created ${user.role} user: ${user.name} (${user.email})`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { createdUserId: user.id, name: user.name, email: user.email, role: user.role },
    });

    return success(res, user, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, user, 'User details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getOwnerDashboard = async (req, res, next) => {
  try {
    const data = await userService.getOwnerDashboard(req.user.id);
    return success(res, data, 'Owner dashboard retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  createUser,
  getUserById,
  getOwnerDashboard,
};

