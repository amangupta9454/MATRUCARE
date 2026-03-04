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

// Admin: approve a doctor
router.put('/:id/approve', protect, authorize('Admin'), doctorController.approveDoctor);

// Admin: remove/delist a doctor
router.delete('/:id', protect, authorize('Admin'), doctorController.removeDoctor);

module.exports = router;
