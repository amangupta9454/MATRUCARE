const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dietController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Mother only routes
router.use(protect, authorize('Mother'));

router.get('/today', ctrl.getTodayPlan);
router.get('/weekly', ctrl.getWeeklyProgress);
router.put('/:id/meal', ctrl.toggleMeal);

module.exports = router;
