const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quizController');
const { protect } = require('../utils/roleMiddleware');

router.use(protect);

router.get('/daily', ctrl.getDailyQuestions);
router.post('/submit', ctrl.submitQuizResult);
router.get('/progress', ctrl.getProgress);

module.exports = router;
