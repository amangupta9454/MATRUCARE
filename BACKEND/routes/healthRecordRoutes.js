const express = require('express');
const healthRecordController = require('../controllers/healthRecordController');
const reminderController = require('../controllers/reminderController');
const { protect, authorize } = require('../utils/roleMiddleware');

const router = express.Router();

// Health Records
router.post('/', protect, healthRecordController.addHealthRecord);
router.get('/', protect, healthRecordController.getPatientRecords);
router.get('/patient/:patientId', protect, healthRecordController.getPatientRecords);
router.put('/:id', protect, healthRecordController.updateRecord);

// Reminders
router.get('/reminders/my-reminders', protect, reminderController.getUserReminders);

module.exports = router;
