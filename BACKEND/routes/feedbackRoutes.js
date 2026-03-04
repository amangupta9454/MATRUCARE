const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feedbackController');
const { protect, authorize } = require('../utils/roleMiddleware');

router.get('/', ctrl.getAllFeedback);
router.post('/', protect, ctrl.submitFeedback);
router.delete('/:id', protect, authorize('Admin'), ctrl.deleteFeedback);

module.exports = router;
