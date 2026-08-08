const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ashaController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Admin routes
router.get('/assignable-users', protect, authorize('Admin', 'Doctor', 'Mother'), ctrl.getAssignableUsers);
router.post('/assign', protect, authorize('Admin'), ctrl.assignAsha);
router.get('/all-assignments', protect, authorize('Admin'), ctrl.getAllAssignments);

// ASHA worker routes
router.get('/my-assignments', protect, authorize('ASHA'), ctrl.getMyAssignments);
router.get('/today-schedule', protect, authorize('ASHA'), ctrl.getTodaySchedule);
router.post('/send-visit-otp', protect, authorize('ASHA'), ctrl.sendVisitOtp);
router.post('/log-visit', protect, authorize('ASHA'), ctrl.logVisit);
router.get('/profile', protect, authorize('ASHA'), ctrl.getAshaProfile);
router.put('/status', protect, authorize('ASHA'), ctrl.updateAshaStatus);
router.put('/leave', protect, authorize('ASHA'), ctrl.manageLeaveDates);

// Shared — Mother, ASHA, Doctor can all view visit logs for a mother
router.get('/visit-logs/:motherId', protect, authorize('Mother', 'ASHA', 'Doctor'), ctrl.getVisitLogs);

// Mother
router.get('/my-visits', protect, authorize('Mother'), ctrl.getMyVisitLogs);
router.get('/mother-schedule', protect, authorize('Mother'), ctrl.getMotherAshaSchedule);
router.post('/schedule-visit', protect, authorize('Mother'), ctrl.scheduleAshaVisitByMother);

module.exports = router;
