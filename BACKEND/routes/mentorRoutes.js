const express = require('express');
const mentorController = require('../controllers/mentorController');
const { protect } = require('../utils/roleMiddleware');

const router = express.Router();

router.post('/register', protect, mentorController.registerMentor);
router.get('/', mentorController.getMentors);
router.put('/profile', protect, mentorController.updateProfile);

module.exports = router;
