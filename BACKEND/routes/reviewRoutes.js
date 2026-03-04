const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Public
router.get('/:doctorId', ctrl.getReviewsForDoctor);

// Mother
router.post('/', protect, authorize('Mother'), ctrl.submitReview);

// Admin
router.delete('/:id', protect, authorize('Admin'), ctrl.deleteReview);

module.exports = router;
