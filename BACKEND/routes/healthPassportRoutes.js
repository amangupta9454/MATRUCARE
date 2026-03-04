const express = require('express');
const { createOrUpdatePassport, getPassport } = require('../controllers/healthPassportController');
const { protect } = require('../utils/roleMiddleware');

const router = express.Router();

router.post('/', protect, createOrUpdatePassport);
router.get('/', protect, getPassport);
router.get('/:userId', protect, getPassport); // For hospital/doctor viewing with QR code

module.exports = router;
