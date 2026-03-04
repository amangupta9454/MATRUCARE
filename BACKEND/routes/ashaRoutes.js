const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ashaController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Admin routes
router.get('/assignable-users', protect, authorize('Admin'), ctrl.getAssignableUsers);
router.post('/assign', protect, authorize('Admin'), ctrl.assignAsha);
router.get('/all-assignments', protect, authorize('Admin'), ctrl.getAllAssignments);

// ASHA worker routes
router.get('/my-assignments', protect, authorize('ASHA'), ctrl.getMyAssignments);
router.post('/log-visit', protect, authorize('ASHA'), ctrl.logVisit);

// Shared — Mother, ASHA, Doctor can all view visit logs for a mother
router.get('/visit-logs/:motherId', protect, ctrl.getVisitLogs);

// Mother — own visit log history
router.get('/my-visits', protect, authorize('Mother'), ctrl.getMyVisitLogs);

module.exports = router;
