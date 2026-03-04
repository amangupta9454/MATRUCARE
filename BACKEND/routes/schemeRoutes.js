const express = require('express');
const router = express.Router();
const { checkEligibility, getMyEligibilities } = require('../controllers/schemeController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Public check (no auth required, but if logged in as Mother, saves result)
router.post('/check', (req, res, next) => {
    // Optionally attach user if token provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return protect(req, res, () => next());
    }
    next();
}, checkEligibility);

// Mother: get own eligibility history
router.get('/my-checks', protect, authorize('Mother'), getMyEligibilities);

module.exports = router;
