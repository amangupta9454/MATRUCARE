const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const emergencyController = require('../controllers/emergencyController');
const { protect, authorize } = require('../utils/roleMiddleware');

const router = express.Router();

router.post('/register', hospitalController.registerHospital);
router.post('/verify-otp', hospitalController.verifyOTP);
router.post('/login', hospitalController.loginHospital);

router.get('/', hospitalController.getHospitals);

// Note: dashboard needs to be above /:id to prevent "dashboard" being matched as an id
router.get('/dashboard/me', protect, authorize('hospital'), hospitalController.getHospitalDashboard);
router.get('/:id', hospitalController.getHospitalById);

// Protected hospital routes
router.post('/doctor', protect, authorize('hospital'), hospitalController.addDoctor);
router.post('/service', protect, authorize('hospital'), hospitalController.addHospitalService);

// Emergency alert
router.post('/emergency', emergencyController.triggerEmergencyAlert);

module.exports = router;
