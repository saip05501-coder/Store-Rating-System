'use strict';

const express = require('express');
const demoController = require('../controllers/demo.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.post('/load', authenticate, authorize(ROLES.ADMIN), demoController.loadDemoData);

module.exports = router;
