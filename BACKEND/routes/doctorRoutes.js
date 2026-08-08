const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../utils/roleMiddleware');
const upload = require('../utils/multer');

const router = express.Router();

// Public: list all listed doctors
router.get('/', doctorController.getApprovedDoctors);

// Admin: fetch all doctors (includes unlisted/pending)
router.get('/all', protect, authorize('Admin'), doctorController.getAllDoctors);

// Admin: platform statistics
router.get('/admin-stats', protect, authorize('Admin'), doctorController.getAdminStats);

// Doctor: manage own profile
router.get('/profile', protect, authorize('Doctor'), doctorController.getDoctorProfile);
router.put('/profile', protect, authorize('Doctor'), upload.single('profileImage'), doctorController.updateDoctorProfile);

// Doctor: manage ASHA workers
router.get('/asha/pending', protect, authorize('Doctor'), doctorController.getPendingAshas);
router.get('/asha/accepted', protect, authorize('Doctor'), doctorController.getAcceptedAshas);
router.post('/asha/:id/accept', protect, authorize('Doctor'), doctorController.acceptAsha);
router.post('/asha/:id/reject', protect, authorize('Doctor'), doctorController.rejectAsha);
router.post('/assign-asha', protect, authorize('Doctor'), doctorController.assignAshaToMother);
router.get('/mother/:id/asha-history', protect, authorize('Doctor'), doctorController.getMotherAshaHistory);
router.get('/asha-schedules/all', protect, authorize('Doctor'), doctorController.getAllPatientAshaSchedules);
router.get('/asha/:id/schedule', protect, authorize('Doctor'), doctorController.getAshaScheduleForDate);
router.post('/schedule-asha', protect, authorize('Doctor'), doctorController.scheduleAshaVisit);

// Admin: approve a doctor
router.put('/:id/approve', protect, authorize('Admin'), doctorController.approveDoctor);

// Admin: remove/delist a doctor
router.delete('/:id', protect, authorize('Admin'), doctorController.removeDoctor);

module.exports = router;
