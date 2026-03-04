const express = require('express');
const { addPolicy, getPolicies, deletePolicy, checkHospitalCoverage } = require('../controllers/insuranceController');
const { protect } = require('../utils/roleMiddleware');

const router = express.Router();

router.use(protect); // Ensure all routes below are protected

router.route('/')
    .post(addPolicy)
    .get(getPolicies);

router.route('/:id')
    .delete(deletePolicy);

router.route('/:id/coverage')
    .get(checkHospitalCoverage);

module.exports = router;
