const User = require('../models/User');
const Doctor = require('../models/Doctor');
const OTPVerification = require('../models/OTPVerification');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const sendEmail = require('../config/nodemailer');
const generateOTP = require('../utils/generateOTP');
const { hashOTP, verifyOTP } = require('../utils/hashOTP');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, specialization } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Upload image to cloudinary if exists
        let profileImage = { url: '', public_id: '' };
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'maacare/users',
            });
            profileImage = { url: result.secure_url, public_id: result.public_id };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profileImage,
        });

        // If role is Doctor, create Doctor profile
        if (role === 'Doctor') {
            await Doctor.create({
                user: user._id,
                specialization: specialization || 'General Physician',
            });
        }

        // Send OTP
        await this.sendOTPVerificationEmail(user, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Helper: Send OTP Email
exports.sendOTPVerificationEmail = async ({ _id, email, name }, res) => {
    try {
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        await OTPVerification.create({
            userId: _id,
            otpHash: hashedOTP,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        });

        const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #008080; text-align: center;">Welcome to MaaCare!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email to access your dashboard. Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>Best Regards,<br/>MaaCare Team</p>
      </div>
    `;

        await sendEmail({
            to: email,
            subject: 'Verify your MaaCare Account',
            html: emailHTML,
        });

        res.status(200).json({
            status: 'PENDING',
            message: 'Verification email sent. Please check your inbox.',
            data: {
                userId: _id,
                email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending verification email' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTPHandler = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ message: 'Empty OTP details are not allowed' });
        }

        const otpRecord = await OTPVerification.findOne({ userId }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Account record doesn\'t exist or has been verified already.' });
        }

        if (otpRecord.expiresAt < Date.now()) {
            await OTPVerification.deleteMany({ userId });
            return res.status(400).json({ message: 'Code has expired. Please request again.' });
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            await OTPVerification.deleteMany({ userId });
            return res.status(400).json({ message: 'Maximum attempts reached. Please request a new OTP.' });
        }

        const isValid = await verifyOTP(otp, otpRecord.otpHash);

        if (!isValid) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ message: 'Invalid code passed. Check your inbox.' });
        }

        await User.updateOne({ _id: userId }, { isVerified: true });
        await OTPVerification.deleteMany({ userId });

        const user = await User.findById(userId);

        res.status(200).json({
            status: 'VERIFIED',
            message: 'Account verified successfully.',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified' });
        }

        await OTPVerification.deleteMany({ userId: user._id });

        // sendOTPVerificationEmail already handles sending the response 
        // We just need to make sure the response includes userId. Wait, sendOTPVerificationEmail sends a response itself.
        await this.sendOTPVerificationEmail(user, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resending OTP' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first', userId: user._id });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await OTPVerification.deleteMany({ userId: user._id });

        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        await OTPVerification.create({
            userId: user._id,
            otpHash: hashedOTP,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #008080;">Password Reset Request</h2>
        <p>Hi \${user.name},</p>
        <p>We received a request to reset your password. Use the code below to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
          \${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

        await sendEmail({
            to: email,
            subject: 'MaaCare Password Reset',
            html: emailHTML,
        });

        res.status(200).json({ message: 'Password reset OTP sent to email.', userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in forgot password request' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        const otpRecord = await OTPVerification.findOne({ userId }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP request not found.' });
        }

        if (otpRecord.expiresAt < Date.now()) {
            await OTPVerification.deleteMany({ userId });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        const isValid = await verifyOTP(otp, otpRecord.otpHash);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        const user = await User.findById(userId);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await OTPVerification.deleteMany({ userId });

        res.status(200).json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
