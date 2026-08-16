'use strict';

const storeService = require('../services/store.service');
const { success, paginated } = require('../utils/response');
const { recordAuditLog } = require('../services/audit.service');
const { getClientIp, getUserAgent } = require('../utils/requestUtils');

const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user ? req.user.id : null;

    const store = await storeService.createStore({ name, email, address, owner_id });

    await recordAuditLog({
      userId: actorId,
      action: 'STORE_CREATED',
      entityType: 'STORE',
      entityId: store.id,
      description: `Store created: ${store.name}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { storeId: store.id, name: store.name, email: store.email, ownerId: store.owner_id },
    });

    if (owner_id) {
      await recordAuditLog({
        userId: actorId,
        action: 'STORE_OWNER_ASSIGNED',
        entityType: 'STORE',
        entityId: store.id,
        description: `Owner #${owner_id} assigned to store: ${store.name}`,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        details: { storeId: store.id, ownerId },
      });
    }

    return success(res, store, 'Store created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getStores = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page, limit } = req.query;
    const userId = req.user ? req.user.id : null;
    const result = await storeService.listStores({ search, sortBy, sortOrder, page, limit, userId });
    return paginated(res, result, 'Stores retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getPlatformStats = async (req, res, next) => {
  try {
    const stats = await storeService.getPlatformStats();
    return success(res, stats, 'Platform statistics retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const store = await storeService.getStoreById(req.params.id, userId);
    return success(res, store, 'Store details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user ? req.user.id : null;

    const updated = await storeService.updateStore(req.params.id, { name, email, address, owner_id });

    await recordAuditLog({
      userId: actorId,
      action: 'STORE_UPDATED',
      entityType: 'STORE',
      entityId: updated.id,
      description: `Store details updated for: ${updated.name}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: {
        storeId: updated.id,
        name: updated.name,
        email: updated.email,
        ownerId: updated.owner_id,
      },
    });

    if (owner_id !== undefined) {
      await recordAuditLog({
        userId: actorId,
        action: 'STORE_OWNER_ASSIGNED',
        entityType: 'STORE',
        entityId: updated.id,
        description: `Owner assignment changed for store: ${updated.name} (owner_id: ${owner_id || 'None'})`,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        details: { storeId: updated.id, ownerId: owner_id || null },
      });
    }

    return success(res, updated, 'Store updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user ? req.user.id : null;

    const result = await storeService.deleteStore(storeId);

    await recordAuditLog({
      userId: actorId,
      action: 'STORE_DELETED',
      entityType: 'STORE',
      entityId: parseInt(storeId, 10),
      description: `Store #${storeId} was deleted permanently`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { deletedStoreId: storeId },
    });

    return success(res, result, 'Store deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStore,
  getStores,
  getPlatformStats,
  getStoreById,
  updateStore,
  deleteStore,
};

