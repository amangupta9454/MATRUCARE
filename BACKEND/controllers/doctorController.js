const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const cloudinary = require('../config/cloudinary');
const sendEmail = require('../config/nodemailer');

// @desc    Get all listed doctors (Public display)
// @route   GET /api/doctors
exports.getApprovedDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ isListed: true })
            .populate('user', 'name email profileImage')
            .select('-__v -license');
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
};

// @desc    Admin: Get ALL doctors (listed + unlisted + pending)
// @route   GET /api/doctors/all
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({})
            .populate('user', 'name email profileImage createdAt')
            .select('-__v');
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching all doctors' });
    }
};

// @desc    Admin: Get platform statistics
// @route   GET /api/doctors/admin-stats
exports.getAdminStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [
            totalDoctors,
            totalPatients,
            totalAppointments,
            todayAppointments,
            rescheduledAppointments,
            cancelledAppointments,
        ] = await Promise.all([
            Doctor.countDocuments(),
            User.countDocuments({ role: 'Mother' }),
            Appointment.countDocuments(),
            Appointment.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
            Appointment.countDocuments({ status: 'Rescheduled' }),
            Appointment.countDocuments({ status: 'Cancelled' }),
        ]);

        res.json({
            totalDoctors,
            totalPatients,
            totalAppointments,
            todayAppointments,
            rescheduledAppointments,
            cancelledAppointments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// @desc    Get doctor profile (Self)
// @route   GET /api/doctors/profile
exports.getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id })
            .populate('user', 'name email profileImage');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Update doctor profile (only if not yet listed)
// @route   PUT /api/doctors/profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        const {
            specialization, bio, availability,
            qualifications, experienceYears, fieldOfExperience,
            specialistType, previousOrganizations, currentOrganization,
            mobile, consultationFee, availableDays, availableSlots
        } = req.body;

        let doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        // LOCK: once isListed is true, profile cannot be changed
        if (doctor.isListed) {
            return res.status(403).json({
                message: 'Your profile is already listed publicly and cannot be edited. Please contact admin to make changes.',
                isLocked: true
            });
        }

        if (specialization) doctor.specialization = specialization;
        if (bio) doctor.bio = bio;
        if (availability) {
            try { doctor.availability = JSON.parse(availability); } catch (e) { }
        }
        if (qualifications) {
            try { doctor.qualifications = JSON.parse(qualifications); } catch (e) { doctor.qualifications = qualifications.split(',').map(s => s.trim()); }
        }
        if (experienceYears) doctor.experienceYears = Number(experienceYears);
        if (fieldOfExperience) doctor.fieldOfExperience = fieldOfExperience;
        if (specialistType) doctor.specialistType = specialistType;
        if (previousOrganizations) {
            try { doctor.previousOrganizations = JSON.parse(previousOrganizations); } catch (e) { doctor.previousOrganizations = previousOrganizations.split(',').map(s => s.trim()); }
        }
        if (currentOrganization) doctor.currentOrganization = currentOrganization;
        if (mobile) doctor.mobile = mobile;
        if (consultationFee) doctor.consultationFee = Number(consultationFee);
        if (availableDays) {
            try { doctor.availableDays = JSON.parse(availableDays); } catch (e) { doctor.availableDays = availableDays.split(',').map(s => s.trim()); }
        }
        if (availableSlots) {
            try { doctor.availableSlots = JSON.parse(availableSlots); } catch (e) { doctor.availableSlots = availableSlots.split(',').map(s => s.trim()); }
        }

        if (req.file) {
            if (doctor.imageUrl && doctor.imageUrl.public_id) {
                await cloudinary.uploader.destroy(doctor.imageUrl.public_id);
            }
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'maacare/doctors',
            });
            doctor.imageUrl = { url: result.secure_url, public_id: result.public_id };
            req.user.profileImage = doctor.imageUrl;
            await req.user.save();
        }

        // Mark listed on first save
        doctor.isListed = true;

        await doctor.save();

        await sendEmail({
            to: req.user.email,
            subject: 'MaaCare - Profile Listed Successfully',
            html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">Profile Listed!</h2><p>Dear Dr. ${req.user.name},</p><p>Your MaaCare profile is now live on the public directory. Patients can book appointments with you.</p><p>Note: Your profile is now locked. Contact admin for any changes.</p><p>Regards,<br/>MaaCare Team</p></div>`,
        });

        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Admin: Approve Doctor
// @route   PUT /api/doctors/:id/approve
exports.approveDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        doctor.isApproved = true;
        await doctor.save();

        await sendEmail({
            to: doctor.user.email,
            subject: 'MaaCare - Doctor Account Verified',
            html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">Account Approved</h2><p>Dear Dr. ${doctor.user.name},</p><p>Your MaaCare doctor account has been verified by the Admin.</p><p>Regards,<br/>MaaCare Team</p></div>`,
        });

        req.app.get('io').emit('doctorApproved', { doctorId: doctor._id, message: 'Profile Approved!' });
        res.json({ message: 'Doctor approved successfully', doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error approving doctor' });
    }
};

// @desc    Admin: Remove / Delist Doctor
// @route   DELETE /api/doctors/:id
exports.removeDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Delist and unapprove, don't delete account
        doctor.isListed = false;
        doctor.isApproved = false;
        await doctor.save();

        await sendEmail({
            to: doctor.user.email,
            subject: 'MaaCare - Profile Removed',
            html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#e53e3e;">Profile Removed</h2><p>Dear Dr. ${doctor.user.name},</p><p>Your MaaCare profile has been removed from the public directory by the Admin. Please contact support for more information.</p><p>Regards,<br/>MaaCare Team</p></div>`,
        });

        res.json({ message: 'Doctor removed from listing', doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing doctor' });
    }
};
