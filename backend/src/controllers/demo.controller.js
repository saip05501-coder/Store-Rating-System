'use strict';

const demoService = require('../services/demo.service');
const { success } = require('../utils/response');

const loadDemoData = async (req, res, next) => {
  try {
    const result = await demoService.loadDemoData();
    return success(res, result, 'Demo data is ready. Existing demo records were updated safely.');
  } catch (error) {
    next(error);
  }
};

module.exports = { loadDemoData };
