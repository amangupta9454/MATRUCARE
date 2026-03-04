const Hospital = require('../models/Hospital');
const HospitalService = require('../models/HospitalService');
const BedAvailability = require('../models/BedAvailability');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

exports.registerHospital = async (req, res) => {
    try {
        const { hospitalName, email, password, address, city, state, phone, hospitalLicense, numberOfBeds, specialties, hospitalDescription, logo } = req.body;

        let hospital = await Hospital.findOne({ email });
        if (hospital) return res.status(400).json({ success: false, message: 'Hospital already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        hospital = new Hospital({
            hospitalName, email, password: hashedPassword, address, city, state, phone, hospitalLicense, numberOfBeds, specialties, hospitalDescription, logo, otp, otpExpires
        });
        await hospital.save();

        await BedAvailability.create({
            hospitalId: hospital._id,
            generalBeds: { total: numberOfBeds, occupied: 0 },
            deliveryBeds: { total: 0, occupied: 0 },
            ICUBeds: { total: 0, occupied: 0 },
            emergencyBeds: { total: 0, occupied: 0 }
        });

        await sendEmail({
            email,
            subject: 'Verify your Hospital Account - MaaCare',
            message: `Your OTP for hospital registration is: <strong>${otp}</strong>. It expires in 10 minutes.`
        });

        res.status(201).json({ success: true, message: 'Hospital registered. Check email for OTP.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const hospital = await Hospital.findOne({ email });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        if (hospital.isVerified) return res.status(400).json({ success: false, message: 'Already verified' });
        if (hospital.otp !== otp || hospital.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        hospital.isVerified = true;
        hospital.otp = undefined;
        hospital.otpExpires = undefined;
        await hospital.save();
        res.status(200).json({ success: true, message: 'Hospital verified successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.loginHospital = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hospital = await Hospital.findOne({ email });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        if (!hospital.isVerified) return res.status(400).json({ success: false, message: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, hospital.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: hospital._id, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ success: true, token, hospital: { id: hospital._id, name: hospital.hospitalName, email: hospital.email, logo: hospital.logo } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHospitalDashboard = async (req, res) => {
    try {
        const hospitalId = req.user.id; // from auth middleware
        const hospital = await Hospital.findById(hospitalId).select('-password');
        const beds = await BedAvailability.findOne({ hospitalId });
        const services = await HospitalService.find({ hospitalId });
        res.status(200).json({ success: true, hospital, beds, services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({ isVerified: true }).select('-password -otp -otpExpires');
        res.status(200).json({ success: true, hospitals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id).select('-password -otp -otpExpires');
        const services = await HospitalService.find({ hospitalId: req.params.id });
        const beds = await BedAvailability.findOne({ hospitalId: req.params.id });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        res.status(200).json({ success: true, hospital, services, beds });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addDoctor = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const doctor = req.body;
        const hospital = await Hospital.findById(hospitalId);
        hospital.doctors.push(doctor);
        await hospital.save();
        res.status(201).json({ success: true, message: 'Doctor added successfully', doctors: hospital.doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addHospitalService = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const { serviceName, description, price, doctorAssigned, availableSlots } = req.body;
        const service = new HospitalService({ hospitalId, serviceName, description, price, doctorAssigned, availableSlots });
        await service.save();
        res.status(201).json({ success: true, message: 'Service added successfully', service });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
