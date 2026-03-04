const express = require('express');
const { getNavigationJourney } = require('../controllers/healthNavigationController');
const { protect } = require('../utils/roleMiddleware');

const router = express.Router();

router.get('/journey', protect, getNavigationJourney);

module.exports = router;
