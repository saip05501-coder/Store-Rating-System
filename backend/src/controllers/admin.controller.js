'use strict';

const adminService = require('../services/admin.service');
const { success, paginated } = require('../utils/response');
const { recordAuditLog } = require('../services/audit.service');
const { getClientIp, getUserAgent } = require('../utils/requestUtils');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminDashboardStats();
    return success(res, stats, 'Admin dashboard statistics retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, name, email, address, role, sortBy, sortOrder, page, limit } = req.query;
    const result = await adminService.listAdminUsers({
      search,
      name,
      email,
      address,
      role,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    return paginated(res, result, 'Users list retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getAdminUserById(req.params.id);
    return success(res, user, 'User details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user?.id || null;

    const user = await adminService.createAdminUser({ name, email, password, address, role });

    await recordAuditLog({
      userId: actorId,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: user.id,
      description: `Administrator created ${user.role} account: ${user.name} (${user.email})`,
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

const getStores = async (req, res, next) => {
  try {
    const { search, name, email, address, sortBy, sortOrder, page, limit } = req.query;
    const result = await adminService.listAdminStores({
      search,
      name,
      email,
      address,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    return paginated(res, result, 'Stores list retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user?.id || null;

    const store = await adminService.createAdminStore({ name, email, address, owner_id });

    await recordAuditLog({
      userId: actorId,
      action: 'STORE_CREATED',
      entityType: 'STORE',
      entityId: store.id,
      description: `Administrator created store: ${store.name}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: {
        storeId: store.id,
        name: store.name,
        email: store.email,
        ownerId: store.owner_id,
        ownerName: store.owner_name,
      },
    });

    if (owner_id) {
      await recordAuditLog({
        userId: actorId,
        action: 'STORE_OWNER_ASSIGNED',
        entityType: 'STORE',
        entityId: store.id,
        description: `Administrator assigned owner #${owner_id} (${store.owner_name || 'Owner'}) to store: ${store.name}`,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        details: { storeId: store.id, ownerId: owner_id, storeName: store.name },
      });
    }

    return success(res, store, 'Store created successfully', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
};

