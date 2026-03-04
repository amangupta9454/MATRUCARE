const express = require('express');
const router = express.Router();
const { getNutritionPlan } = require('../controllers/nutritionController');
const { sendEmergencyAlert } = require('../controllers/emergencyController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Nutrition plan — derived from pregnancy profile
router.get('/nutrition', protect, authorize('Mother'), getNutritionPlan);

// Emergency alert — Mother only
router.post('/emergency', protect, authorize('Mother'), sendEmergencyAlert);

module.exports = router;
