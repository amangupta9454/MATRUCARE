const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Asha = require('../models/Asha');
const AshaAssignment = require('../models/AshaAssignment');
const VisitSchedule = require('../models/VisitSchedule');
const VisitLog = require('../models/VisitLog');
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

// @desc    Get pending ASHA workers for a doctor
// @route   GET /api/doctors/asha/pending
exports.getPendingAshas = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const pendingAshas = await Asha.find({
            connectedDoctors: { $ne: doctor._id },
            rejectedDoctors: { $ne: doctor._id }
        }).populate('user', 'name email profileImage createdAt');

        res.json(pendingAshas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching pending ASHAs' });
    }
};

// @desc    Get accepted ASHA workers for a doctor
// @route   GET /api/doctors/asha/accepted
exports.getAcceptedAshas = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const ashas = await Asha.find({
            connectedDoctors: doctor._id
        }).populate('user', 'name email profileImage createdAt');

        res.json(ashas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching accepted ASHAs' });
    }
};

// @desc    Accept an ASHA worker
// @route   POST /api/doctors/asha/:id/accept
exports.acceptAsha = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const asha = await Asha.findById(req.params.id).populate('user', 'name email');
        if (!asha) return res.status(404).json({ message: 'ASHA not found' });

        if (!asha.connectedDoctors.includes(doctor._id)) {
            asha.connectedDoctors.push(doctor._id);
        }
        asha.isApproved = true; // Mark as approved generally
        
        // Remove from rejected if they were previously rejected
        asha.rejectedDoctors = asha.rejectedDoctors.filter(id => id.toString() !== doctor._id.toString());
        await asha.save();

        await sendEmail({
            to: asha.user.email,
            subject: 'MaaCare - Doctor Accepted Your Connection',
            html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">Connection Accepted</h2><p>Dear ${asha.user.name},</p><p>Dr. ${req.user.name} has accepted your connection request and you can now be assigned to mothers in their hospital network.</p><p>Regards,<br/>MaaCare Team</p></div>`,
        });

        res.json({ message: 'ASHA accepted successfully', asha });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error accepting ASHA' });
    }
};

// @desc    Reject an ASHA worker
// @route   POST /api/doctors/asha/:id/reject
exports.rejectAsha = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const asha = await Asha.findById(req.params.id).populate('user', 'name email');
        if (!asha) return res.status(404).json({ message: 'ASHA not found' });

        if (!asha.rejectedDoctors.includes(doctor._id)) {
            asha.rejectedDoctors.push(doctor._id);
        }
        await asha.save();

        await sendEmail({
            to: asha.user.email,
            subject: 'MaaCare - Doctor Connection Rejected',
            html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#e53e3e;">Connection Rejected</h2><p>Dear ${asha.user.name},</p><p>Dr. ${req.user.name} has rejected your connection request. You will not be assigned to their patients.</p><p>Regards,<br/>MaaCare Team</p></div>`,
        });

        res.json({ message: 'ASHA rejected successfully', asha });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error rejecting ASHA' });
    }
};

// @desc    Assign ASHA to Mother
// @route   POST /api/doctors/assign-asha
exports.assignAshaToMother = async (req, res) => {
    try {
        const { motherId, ashaId, notes } = req.body;
        
        const mother = await User.findOne({ _id: motherId, role: 'Mother' });
        if (!mother) return res.status(404).json({ message: 'Mother not found' });

        const asha = await Asha.findById(ashaId).populate('user');
        if (!asha) return res.status(404).json({ message: 'ASHA worker not found' });

        const assignment = await AshaAssignment.findOneAndUpdate(
            { mother: motherId },
            { 
                mother: motherId, 
                ashaWorker: asha.user._id, 
                region: asha.region || 'Assigned by Doctor',
                notes, 
                assignedBy: req.user._id, 
                assignedDate: new Date() 
            },
            { upsert: true, new: true }
        ).populate('mother ashaWorker', 'name email');

        await Promise.all([
            sendEmail({
                to: asha.user.email,
                subject: 'MaaCare - New Mother Assigned',
                html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">New Assignment</h2><p>Dear ${asha.user.name}, you have been assigned to support ${mother.name}.</p></div>`
            }),
            sendEmail({
                to: mother.email,
                subject: 'MaaCare - ASHA Worker Assigned',
                html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">ASHA Worker Assigned</h2><p>Dear ${mother.name}, ASHA worker ${asha.user.name} has been assigned to you by Dr. ${req.user.name}.</p></div>`
            })
        ]);

        res.status(201).json(assignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error assigning ASHA' });
    }
};

// @desc    Get all ASHA schedules for a doctor's patients
// @route   GET /api/doctors/asha-schedules/all
exports.getAllPatientAshaSchedules = async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        // Find all appointments for this doctor to extract mother IDs
        const appointments = await Appointment.find({ doctor: doctor._id }).select('mother');
        const motherIds = [...new Set(appointments.map(a => a.mother?.toString()).filter(Boolean))];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const schedules = await VisitSchedule.find({
            mother: { $in: motherIds },
            date: { $gte: today }
        })
        .populate('mother', 'name profileImage email')
        .populate('ashaWorker', 'name profileImage')
        .sort({ date: 1, time: 1 });

        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching patient ASHA schedules' });
    }
};

// @desc    Get an ASHA worker's schedule for a specific date
// @route   GET /api/doctors/asha/:id/schedule?date=YYYY-MM-DD
exports.getAshaScheduleForDate = async (req, res) => {
    try {
        const dateStr = req.query.date;
        if (!dateStr) return res.status(400).json({ message: 'Date is required' });
        
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const asha = await Asha.findById(req.params.id);
        if (!asha) return res.status(404).json({ message: 'ASHA not found' });

        const schedule = await VisitSchedule.find({
            ashaWorker: asha.user,
            date: { $gte: date, $lt: nextDay }
        }).populate('mother', 'name').sort('time');

        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching ASHA schedule' });
    }
};

// @desc    Schedule ASHA Visit
// @route   POST /api/doctors/schedule-asha
exports.scheduleAshaVisit = async (req, res) => {
    try {
        const { motherId, ashaId, date, time, location } = req.body;
        
        const mother = await User.findOne({ _id: motherId, role: 'Mother' });
        if (!mother) return res.status(404).json({ message: 'Mother not found' });

        const asha = await Asha.findById(ashaId).populate('user');
        if (!asha) return res.status(404).json({ message: 'ASHA worker not found' });

        // If not assigned yet, assign them as well
        await AshaAssignment.findOneAndUpdate(
            { mother: motherId },
            { 
                mother: motherId, 
                ashaWorker: asha.user._id, 
                region: asha.region || 'Assigned by Doctor',
                assignedBy: req.user._id, 
                assignedDate: new Date() 
            },
            { upsert: true }
        );

        // For the mock travel time: if there's any other schedule on the same day, set to 15 mins.
        const scheduleDate = new Date(date);
        scheduleDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(scheduleDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = scheduleDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Check if ASHA is on leave
        if (diffDays === 0 && asha.isOnlineToday === false) {
            return res.status(400).json({ message: 'This ASHA worker is offline today. Please select another date.' });
        }
        const isLeave = asha.leaveDates && asha.leaveDates.some(leaveDate => {
            const leaveDateObj = new Date(leaveDate);
            leaveDateObj.setHours(0, 0, 0, 0);
            return leaveDateObj.getTime() === scheduleDate.getTime();
        });
        if (isLeave) {
            return res.status(400).json({ message: 'This ASHA worker is on leave on this date. Please select another date.' });
        }

        const existingSchedules = await VisitSchedule.find({
            ashaWorker: asha.user._id,
            date: { $gte: scheduleDate, $lt: nextDay }
        });

        // Check for conflicting time
        const conflictingSchedule = existingSchedules.find(s => s.time === time);
        if (conflictingSchedule) {
            return res.status(400).json({ message: 'This ASHA worker is already assigned to another mother at this exact time.' });
        }

        const travelTimeFromPrevious = existingSchedules.length > 0 ? '15 mins' : '0 mins';

        const visit = await VisitSchedule.create({
            ashaWorker: asha.user._id,
            mother: motherId,
            doctor: req.user._id, // the doctor's user id
            date: scheduleDate,
            time,
            location: location || mother.address || 'Patient Home',
            travelTimeFromPrevious
        });

        req.app.get('io').emit('ashaScheduleUpdated');
        res.status(201).json(visit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error scheduling ASHA' });
    }
};

// @desc    Get mother's ASHA assignment and last visit history
// @route   GET /api/doctors/mother/:id/asha-history
exports.getMotherAshaHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await AshaAssignment.findOne({ mother: id }).populate('ashaWorker', 'name email');
        const lastVisit = await VisitLog.findOne({ mother: id }).populate('ashaWorker', 'name email').sort('-visitDate');
        
        res.json({
            fixedAsha: assignment ? assignment.ashaWorker : null,
            lastVisit: lastVisit || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching mother history' });
    }
};
