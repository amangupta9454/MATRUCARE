const express = require('express');
const bookingController = require('../controllers/hospitalBookingController');
const { protect, authorize } = require('../utils/roleMiddleware');

const router = express.Router();

// Public / Patient
router.post('/', bookingController.createBooking); // Allows unauthenticated or you can add `protect`
router.get('/my-bookings', protect, bookingController.getUserBookings);

// Hospital
router.get('/hospital-bookings', protect, authorize('hospital'), bookingController.getHospitalBookings);
router.put('/:id/status', protect, authorize('hospital'), bookingController.updateBookingStatus);

module.exports = router;
