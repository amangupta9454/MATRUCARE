const express = require('express');
const router = express.Router();
const { getAdvancedInsights, exportData, triggerScheduler } = require('../controllers/insightsController');
const { protect, authorize } = require('../utils/roleMiddleware');

router.get('/advanced', protect, authorize('Admin'), getAdvancedInsights);
router.get('/export', protect, authorize('Admin'), exportData);
router.post('/scheduler/run', protect, authorize('Admin'), triggerScheduler);

module.exports = router;
