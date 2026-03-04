const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pregnancyController');
const { protect, authorize } = require('../utils/roleMiddleware');
const upload = require('../utils/multer');

// All routes — Mother only
router.use(protect, authorize('Mother'));

router.post('/profile', ctrl.createOrUpdateProfile);
router.put('/profile', ctrl.createOrUpdateProfile);
router.get('/profile', ctrl.getProfile);

router.get('/anc', ctrl.getANCVisits);
router.put('/anc', ctrl.markANCVisit);

router.get('/vaccinations', ctrl.getVaccinations);
router.put('/vaccination', upload.single('proof'), ctrl.markVaccination);

router.post('/medicines', ctrl.addMedicine);
router.get('/medicines', ctrl.getMedicines);
router.delete('/medicines/:id', ctrl.deleteMedicine);

module.exports = router;
