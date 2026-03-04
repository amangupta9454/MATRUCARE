const express = require('express');
const router = express.Router();
const { getDashboardStats, getRiskHeatmapData } = require('../controllers/analyticsController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Admin only
router.get('/stats', protect, authorize('Admin'), getDashboardStats);
router.get('/heatmap', protect, authorize('Admin'), getRiskHeatmapData);

module.exports = router;
