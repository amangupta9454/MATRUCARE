const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recommendationController');

// Public
router.get('/', ctrl.getRecommendations);

module.exports = router;
