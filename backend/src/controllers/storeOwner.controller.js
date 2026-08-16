'use strict';

const storeOwnerService = require('../services/storeOwner.service');
const { success, paginated } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const data = await storeOwnerService.getStoreOwnerDashboard(req.user.id);
    return success(res, data, 'Store owner dashboard data retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getRatings = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await storeOwnerService.getStoreOwnerRatings(req.user.id, { page, limit });
    return paginated(res, result, 'Store ratings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getRatings,
};
