const express = require('express');
const { addEmergencyContact, getEmergencyContacts, triggerSOS, triggerEmergencyAlert } = require('../controllers/emergencyController');
const { protect } = require('../utils/roleMiddleware');

const router = express.Router();

// Existing
router.post('/alert', triggerEmergencyAlert);

// New
router.post('/contacts', protect, addEmergencyContact);
router.get('/contacts', protect, getEmergencyContacts);
router.post('/sos', protect, triggerSOS);

module.exports = router;
