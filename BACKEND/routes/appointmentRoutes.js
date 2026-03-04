const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../utils/roleMiddleware');
const upload = require('../utils/multer');

const router = express.Router();

// Mother routes
router.post('/', protect, authorize('Mother'), upload.single('attachment'), appointmentController.bookAppointment);
router.delete('/:id', protect, authorize('Mother'), appointmentController.cancelAppointment);
router.put('/:id/reschedule', protect, authorize('Mother', 'Doctor'), appointmentController.rescheduleAppointment);

// Doctor routes
router.put('/:id/status', protect, authorize('Doctor'), appointmentController.updateAppointmentStatus);
router.put('/:id/prescription', protect, authorize('Doctor'), upload.single('prescriptionFile'), appointmentController.uploadPrescription);

// Common routes
router.get('/', protect, appointmentController.getAppointments);

module.exports = router;
