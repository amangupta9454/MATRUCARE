const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teleConsultController');
const { protect, authorize } = require('../utils/roleMiddleware');

// Mother
router.post('/', protect, authorize('Mother'), ctrl.requestTeleConsult);
router.get('/my', protect, authorize('Mother'), ctrl.getMyTeleConsults);

// Doctor
router.get('/doctor', protect, authorize('Doctor'), ctrl.getDoctorTeleConsults);
router.put('/:id', protect, authorize('Doctor'), ctrl.updateTeleConsult);

// Joint (Mother + Doctor) — verify room access before joining Jitsi
router.get('/join/:consultId', protect, authorize('Mother', 'Doctor'), ctrl.verifyRoomAccess);

module.exports = router;
