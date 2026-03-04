const express = require('express');
const router = express.Router();
// Wait, express.Router() is the correct syntax.
const authController = require('../controllers/authController');
const upload = require('../utils/multer');

const routerInstance = express.Router();

routerInstance.post('/register', upload.single('profileImage'), authController.register);
routerInstance.post('/verify-otp', authController.verifyOTPHandler);
routerInstance.post('/resend-otp', authController.resendOTP);
routerInstance.post('/login', authController.login);
routerInstance.post('/forgot-password', authController.forgotPassword);
routerInstance.post('/reset-password', authController.resetPassword);

module.exports = routerInstance;
