const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatController');
const { protect } = require('../utils/roleMiddleware');

router.use(protect);

router.get('/contacts', ctrl.getContacts);
router.get('/:userId', ctrl.getMessages);
router.post('/send', ctrl.sendMessage);

module.exports = router;
