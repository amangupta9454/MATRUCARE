const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { protect, authorize } = require('../utils/roleMiddleware');
const upload = require('../utils/multer');

// Mother: upload and manage own reports
router.post('/', protect, authorize('Mother'), upload.single('report'), ctrl.uploadReport);
router.get('/', protect, authorize('Mother'), ctrl.getMyReports);
router.delete('/:id', protect, authorize('Mother'), ctrl.deleteReport);

// Doctor: view reports of own patients
router.get('/patients', protect, authorize('Doctor'), ctrl.getDoctorPatientReports);

module.exports = router;
