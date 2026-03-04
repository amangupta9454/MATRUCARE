const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vaccinationController');
const { protect, authorize } = require('../utils/roleMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', protect, authorize('Mother'), ctrl.getMyBabyVaccinations);
router.put('/mark', protect, authorize('Mother'), upload.single('proof'), ctrl.markBabyVaccination);
router.delete('/:id/proof', protect, ctrl.deleteVaccineProof);

module.exports = router;
