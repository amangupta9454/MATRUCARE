const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/babyController');
const { protect, authorize } = require('../utils/roleMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Mother routes
router.post('/', protect, authorize('Mother'), ctrl.createBabyProfile);
router.get('/', protect, authorize('Mother'), ctrl.getBabyProfile);
router.put('/', protect, authorize('Mother'), ctrl.updateBabyProfile);
router.get('/growth', protect, authorize('Mother'), ctrl.getGrowthRecords);

// Doctor routes
router.post('/growth', protect, authorize('Doctor'), ctrl.addGrowthRecord);
router.get('/:babyId', protect, ctrl.getBabyProfile);

module.exports = router;
