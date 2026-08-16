'use strict';

const ratingService = require('../services/rating.service');
const { success, paginated } = require('../utils/response');
const { recordAuditLog } = require('../services/audit.service');
const { getClientIp, getUserAgent } = require('../utils/requestUtils');

const submitRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user.id;

    const result = await ratingService.submitOrUpdateRating(actorId, store_id, rating);

    await recordAuditLog({
      userId: actorId,
      action: 'RATING_SUBMITTED',
      entityType: 'RATING',
      entityId: parseInt(store_id, 10),
      description: `User submitted ${rating}-star rating for store #${store_id}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { storeId: store_id, rating },
    });

    return success(res, result, 'Rating submitted/updated successfully');
  } catch (err) {
    next(err);
  }
};

const getMyRatings = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await ratingService.getUserRatings(req.user.id, { page, limit });
    return paginated(res, result, 'Ratings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getStoreRatings = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { page, limit } = req.query;
    const result = await ratingService.getStoreRatings(storeId, {
      page,
      limit,
      requester: req.user,
    });
    return paginated(res, result, 'Store ratings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const createRatingForStore = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.store_id;
    const { rating } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user.id;

    const result = await ratingService.createRating(actorId, storeId, rating);

    await recordAuditLog({
      userId: actorId,
      action: 'RATING_SUBMITTED',
      entityType: 'RATING',
      entityId: parseInt(storeId, 10),
      description: `User submitted ${rating}-star rating for store #${storeId}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { storeId, rating },
    });

    return success(res, result, 'Rating submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateRatingForStore = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.store_id;
    const { rating } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const actorId = req.user.id;

    const result = await ratingService.updateRating(actorId, storeId, rating);

    await recordAuditLog({
      userId: actorId,
      action: 'RATING_UPDATED',
      entityType: 'RATING',
      entityId: parseInt(storeId, 10),
      description: `User modified rating to ${rating} stars for store #${storeId}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { storeId, rating },
    });

    return success(res, result, 'Rating updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitRating,
  createRatingForStore,
  updateRatingForStore,
  getMyRatings,
  getStoreRatings,
};


