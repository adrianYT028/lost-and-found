const express = require('express');
const router = express.Router();

// Import admin sub-routes
const usersAPI = require('./users');
const itemsAPI = require('./items');
const foundItemsAPI = require('./found-items');
const dashboardStatsAPI = require('./dashboard/stats');

// Mount admin routes
router.use('/users', usersAPI);
router.use('/items', itemsAPI);
router.use('/found-items', foundItemsAPI);
router.use('/dashboard/stats', dashboardStatsAPI);

module.exports = router;
