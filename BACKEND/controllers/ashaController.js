const AshaAssignment = require('../models/AshaAssignment');
const VisitSchedule = require('../models/VisitSchedule');
const Asha = require('../models/Asha');
const VisitLog = require('../models/VisitLog');
const PregnancyProfile = require('../models/PregnancyProfile');
const ANCVisit = require('../models/ANCVisit');
const User = require('../models/User');
const OTPVerification = require('../models/OTPVerification');
const generateOTP = require('../utils/generateOTP');
const { hashOTP, verifyOTP } = require('../utils/hashOTP');
const sendEmail = require('../config/nodemailer');

// ── Admin: Assign ASHA worker to mother ─────────────────────────────────────
exports.assignAsha = async (req, res) => {
    try {
        const { motherId, ashaWorkerId, region, notes } = req.body;

        // Validate both users exist with correct roles
        const [mother, ashaWorker] = await Promise.all([
            User.findOne({ _id: motherId, role: 'Mother' }),
            User.findOne({ _id: ashaWorkerId, role: 'ASHA' }),
        ]);
        if (!mother) return res.status(404).json({ message: 'Mother not found' });
        if (!ashaWorker) return res.status(404).json({ message: 'ASHA worker not found' });

        const assignment = await AshaAssignment.findOneAndUpdate(
            { mother: motherId },
            { mother: motherId, ashaWorker: ashaWorkerId, region, notes, assignedBy: req.user._id, assignedDate: new Date() },
            { upsert: true, new: true }
        ).populate('mother ashaWorker', 'name email');

        // Notify both
        await Promise.all([
            sendEmail({
                to: ashaWorker.email,
                subject: 'MaaCare – New Mother Assignment',
                html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">New Assignment</h2><p>Dear ${ashaWorker.name},</p><p>You have been assigned to support <strong>${mother.name}</strong> in the <strong>${region}</strong> region.</p><p>Please visit her soon and log your visit in the MaaCare system.</p><p>Regards,<br/>MaaCare Team</p></div>`,
            }),
            sendEmail({
                to: mother.email,
                subject: 'MaaCare – ASHA Worker Assigned to You',
                html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">ASHA Worker Assigned</h2><p>Dear ${mother.name},</p><p>An ASHA worker <strong>${ashaWorker.name}</strong> has been assigned to support your maternal health journey in <strong>${region}</strong>.</p><p>She will visit you periodically and help you with health tracking and government schemes.</p><p>Regards,<br/>MaaCare Team</p></div>`,
            }),
        ]);

        res.status(201).json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error assigning ASHA worker' });
    }
};

// ── Admin: Get all ASHA assignments ─────────────────────────────────────────
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await AshaAssignment.find()
            .populate('mother', 'name email')
            .populate('ashaWorker', 'name email')
            .sort('-assignedDate');
        res.json(assignments);
    } catch (err) { res.status(500).json({ message: 'Error fetching assignments' }); }
};

// ── Admin: Get all mothers and ASHA workers (for assignment UI dropdowns) ────
exports.getAssignableUsers = async (req, res) => {
    try {
        const [mothers, ashaWorkers] = await Promise.all([
            User.find({ role: 'Mother' }).select('name email'),
            User.find({ role: 'ASHA' }).select('name email'),
        ]);
        res.json({ mothers, ashaWorkers });
    } catch (err) { res.status(500).json({ message: 'Error fetching users' }); }
};

// ── ASHA: Get own assigned mothers with full profile data ────────────────────
exports.getMyAssignments = async (req, res) => {
    try {
        const assignments = await AshaAssignment.find({ ashaWorker: req.user._id })
            .populate('mother', 'name email profileImage mobile address');

        const ashaProfile = await Asha.findOne({ user: req.user._id }).populate({
            path: 'connectedDoctors',
            populate: { path: 'user', select: 'name email profileImage' }
        });

        const enriched = await Promise.all(assignments.map(async a => {
            const profile = await PregnancyProfile.findOne({ mother: a.mother._id })
                .select('pregnancyWeek riskLevel riskScore expectedDeliveryDate bmi hemoglobin');
            const ancVisits = await ANCVisit.find({ patient: a.mother._id });
            const nextAnc = ancVisits.find(v => !v.completed);
            const lastVisit = await VisitLog.findOne({ mother: a.mother._id, ashaWorker: req.user._id }).sort('-visitDate');

            return {
                assignment: a,
                profile,
                nextAncWeek: nextAnc?.visitWeek || null,
                lastVisitDate: lastVisit?.visitDate || null,
            };
        }));

        res.json({ assignments: enriched, connectedDoctors: ashaProfile?.connectedDoctors || [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
};

// ── ASHA: Get today's schedule ────────────────────────────────────────────────
exports.getTodaySchedule = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const schedule = await VisitSchedule.find({
            ashaWorker: req.user._id,
            date: { $gte: today, $lt: tomorrow }
        })
        .populate('mother', 'name email profileImage address')
        .populate('doctor', 'name email')
        .sort('time');

        res.json(schedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching today schedule' });
    }
};

// ── ASHA: Send OTP for home visit ─────────────────────────────────────────────
exports.sendVisitOtp = async (req, res) => {
    try {
        const { motherId } = req.body;
        const mother = await User.findOne({ _id: motherId, role: 'Mother' });
        if (!mother) return res.status(404).json({ message: 'Mother not found' });

        // Clean up any existing unverified OTPs for this user
        await OTPVerification.deleteMany({ userId: mother._id });

        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        await OTPVerification.create({
            userId: mother._id,
            otpHash: hashedOTP,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
        });

        await sendEmail({
            to: mother.email,
            subject: 'MaaCare – Visit Verification OTP',
            html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">Visit Verification</h2><p>Dear ${mother.name},</p><p>Your ASHA worker is recording a home visit. Please share this OTP with them to confirm the visit:</p><div style="background-color: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</div><p>This code expires in 10 minutes.</p></div>`,
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending visit OTP' });
    }
};

// ── ASHA: Log a home visit ───────────────────────────────────────────────────
exports.logVisit = async (req, res) => {
    try {
        const {
            motherId, visitDate, bloodPressure, weight, hemoglobin,
            observations, recommendations, nextVisitDate, syncedFromOffline, otp
        } = req.body;

        // Verify mother exists
        const mother = await User.findOne({ _id: motherId, role: 'Mother' });
        if (!mother) return res.status(404).json({ message: 'Mother not found' });

        // Verify OTP if not syncing from offline
        if (!syncedFromOffline) {
            if (!otp) return res.status(400).json({ message: 'OTP is required to log a visit' });
            
            const otpRecord = await OTPVerification.findOne({ userId: mother._id }).sort({ createdAt: -1 });
            if (!otpRecord) return res.status(400).json({ message: 'OTP request not found or expired' });
            if (otpRecord.expiresAt < Date.now()) {
                await OTPVerification.deleteMany({ userId: mother._id });
                return res.status(400).json({ message: 'OTP expired. Please send a new one.' });
            }

            const isValid = await verifyOTP(otp, otpRecord.otpHash);
            if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

            await OTPVerification.deleteMany({ userId: mother._id });
        }

        const log = await VisitLog.create({
            mother: motherId,
            ashaWorker: req.user._id,
            visitDate: visitDate || new Date(),
            bloodPressure, weight, hemoglobin,
            observations, recommendations, nextVisitDate,
            syncedFromOffline: syncedFromOffline || false,
        });

        // Notify assigned doctor via pregnancy profile
        const profile = await PregnancyProfile.findOne({ mother: motherId })
            .populate({ path: 'assignedDoctor', populate: { path: 'user', select: 'name email' } });

        if (profile?.assignedDoctor?.user?.email) {
            await sendEmail({
                to: profile.assignedDoctor.user.email,
                subject: `MaaCare – ASHA Visit Log: ${mother.name}`,
                html: `
                <div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid #008080;">
                  <h2 style="color:#008080;">ASHA Home Visit Summary</h2>
                  <p><strong>Patient:</strong> ${mother.name} (${mother.email})</p>
                  <p><strong>Visit Date:</strong> ${new Date(visitDate || new Date()).toLocaleDateString('en-IN')}</p>
                  <p><strong>ASHA Worker:</strong> ${req.user.name}</p>
                  <table style="border-collapse:collapse;width:100%;margin-top:12px;">
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Blood Pressure</td><td style="padding:6px">${bloodPressure || 'N/A'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Weight</td><td style="padding:6px">${weight ? weight + ' kg' : 'N/A'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Hemoglobin</td><td style="padding:6px">${hemoglobin ? hemoglobin + ' g/dL' : 'N/A'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Observations</td><td style="padding:6px">${observations || 'None'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Recommendations</td><td style="padding:6px">${recommendations || 'None'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Next Visit</td><td style="padding:6px">${nextVisitDate ? new Date(nextVisitDate).toLocaleDateString('en-IN') : 'Not scheduled'}</td></tr>
                  </table>
                  <p style="margin-top:16px;color:#718096;font-size:12px;">Auto-generated by MaaCare Field Reporting System</p>
                </div>`,
            });
        }

        req.app.get('io').emit('ashaScheduleUpdated');
        res.status(201).json(log);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging visit' });
    }
};

// ── Get visit logs for a mother (ASHA / Doctor / Mother herself) ─────────────
exports.getVisitLogs = async (req, res) => {
    try {
        const { motherId } = req.params;
        const logs = await VisitLog.find({ mother: motherId })
            .populate('ashaWorker', 'name email')
            .sort('-visitDate');
        res.json(logs);
    } catch (err) { res.status(500).json({ message: 'Error fetching visit logs' }); }
};

// ── Get own visit logs (for Mother's health dashboard) ───────────────────────
exports.getMyVisitLogs = async (req, res) => {
    try {
        const logs = await VisitLog.find({ mother: req.user._id })
            .populate('ashaWorker', 'name email')
            .sort('-visitDate');
        res.json(logs);
    } catch (err) { res.status(500).json({ message: 'Error fetching own visit logs' }); }
};

// ── Mother: Get upcoming ASHA visit schedule ──────────────────────────────────
exports.getMotherAshaSchedule = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const schedule = await VisitSchedule.find({
            mother: req.user._id,
            date: { $gte: today }
        })
        .populate('ashaWorker', 'name email profileImage')
        .populate('doctor', 'name')
        .sort('date time');

        res.json(schedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching mother schedule' });
    }
};

// ── Mother: Schedule an ASHA visit ─────────────────────────────────────────────
exports.scheduleAshaVisitByMother = async (req, res) => {
    try {
        const { date, time, location, alternateAshaId } = req.body;
        const motherId = req.user._id;

        let ashaWorkerId = alternateAshaId;

        // If no alternate ASHA is provided, use the mother's assigned ASHA worker
        if (!ashaWorkerId) {
            const AshaAssignment = require('../models/AshaAssignment');
            const assignment = await AshaAssignment.findOne({ mother: motherId });
            
            if (!assignment || !assignment.ashaWorker) {
                return res.status(400).json({ message: 'No ASHA worker is currently assigned to you.' });
            }
            ashaWorkerId = assignment.ashaWorker;
        }

        // 2. Validate maximum 7 days in advance
        const scheduleDate = new Date(date);
        scheduleDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = scheduleDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            return res.status(400).json({ message: 'Cannot schedule visits in the past.' });
        }
        if (diffDays > 7) {
            return res.status(400).json({ message: 'You can only schedule up to 1 week (7 days) in advance.' });
        }

        const nextDay = new Date(scheduleDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // 2.5 Check if ASHA is on leave
        const ashaProfile = await Asha.findOne({ user: ashaWorkerId });
        if (ashaProfile) {
            if (diffDays === 0 && ashaProfile.isOnlineToday === false) {
                return res.status(400).json({ message: 'Your ASHA worker is offline today. Please select another date.' });
            }
            const isLeave = ashaProfile.leaveDates.some(leaveDate => {
                const leaveDateObj = new Date(leaveDate);
                leaveDateObj.setHours(0, 0, 0, 0);
                return leaveDateObj.getTime() === scheduleDate.getTime();
            });
            if (isLeave) {
                return res.status(400).json({ message: 'Your ASHA worker is on leave on this date. Please select another date.' });
            }
        }

        // 3. Query existing schedules for the ASHA worker on that day
        const existingSchedules = await VisitSchedule.find({
            ashaWorker: ashaWorkerId,
            date: { $gte: scheduleDate, $lt: nextDay }
        });

        // 4. Check for conflicting time
        const conflictingSchedule = existingSchedules.find(s => s.time === time);
        if (conflictingSchedule) {
            return res.status(400).json({ message: 'Your ASHA worker is already booked at this exact time. Please select another time.' });
        }

        // 5. Calculate travel time if other visits exist
        const travelTimeFromPrevious = existingSchedules.length > 0 ? '15 mins' : '0 mins';

        // 6. Create the visit schedule
        const mother = await User.findById(motherId);
        const visit = await VisitSchedule.create({
            ashaWorker: ashaWorkerId,
            mother: motherId,
            date: scheduleDate,
            time,
            location: location || mother.address || 'Patient Home',
            travelTimeFromPrevious
        });

        req.app.get('io').emit('ashaScheduleUpdated');
        res.status(201).json(visit);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error scheduling visit.' });
    }
};

exports.getAshaProfile = async (req, res) => {
    try {
        const asha = await Asha.findOne({ user: req.user._id });
        if (!asha) return res.status(404).json({ message: 'ASHA record not found' });
        res.json(asha);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching ASHA profile.' });
    }
};

// ── Leave Management & Notifications ───────────────────────────────────────────

const cancelAndNotifyAppointments = async (ashaId, startOfDay, endOfDay, reasonText) => {
    try {
        const ashaWorker = await User.findById(ashaId);
        
        // Find existing non-cancelled appointments for the given time frame
        const appointments = await VisitSchedule.find({
            ashaWorker: ashaId,
            date: { $gte: startOfDay, $lt: endOfDay },
            status: { $ne: 'Cancelled' }
        }).populate('mother', 'name email').populate('doctor', 'name email');

        for (let apt of appointments) {
            apt.status = 'Cancelled';
            await apt.save();

            const dateStr = new Date(apt.date).toLocaleDateString('en-IN');
            const mailOptions = {
                subject: `Appointment Cancelled: ASHA Worker Unavailable on ${dateStr}`,
                text: `Dear ${apt.doctor?.name ? 'Dr. ' + apt.doctor.name : (apt.mother?.name || 'Patient')},\n\nYour scheduled ASHA visit with ${ashaWorker?.name || 'your ASHA worker'} on ${dateStr} at ${apt.time} has been cancelled.\n\nReason: This ASHA is offline today/on this date. You can assign another ASHA worker from your dashboard for the same time if available, otherwise choose another time.\n\nThank you,\nMaaCare Team`
            };

            if (apt.doctor && apt.doctor.email) {
                mailOptions.to = apt.doctor.email;
                await sendEmail(mailOptions);
            } else if (apt.mother && apt.mother.email) {
                mailOptions.to = apt.mother.email;
                await sendEmail(mailOptions);
            }
        }
        req.app.get('io').emit('ashaScheduleUpdated');
        
        // Optionally email the ASHA worker too
        if (appointments.length > 0) {
            await sendEmail({
                to: ashaWorker.email,
                subject: `Leave Confirmed: Appointments Cancelled`,
                text: `Dear ${ashaWorker.name},\n\nYour leave on ${startOfDay.toLocaleDateString('en-IN')} is confirmed. We have automatically cancelled ${appointments.length} appointment(s) scheduled for this date and notified the respective doctors/mothers.\n\nThank you,\nMaaCare Team`
            });
        }
    } catch (err) {
        console.error("Error cancelling/notifying appointments:", err);
    }
};

exports.updateAshaStatus = async (req, res) => {
    try {
        const { isOnlineToday } = req.body;
        const asha = await Asha.findOne({ user: req.user._id });
        if (!asha) return res.status(404).json({ message: 'ASHA record not found' });

        asha.isOnlineToday = isOnlineToday;
        await asha.save();

        if (!isOnlineToday) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Run in background so request doesn't hang
            cancelAndNotifyAppointments(req.user._id, today, tomorrow, 'is offline today');
        }

        res.json({ message: `Status updated to ${isOnlineToday ? 'Online' : 'Offline'}`, isOnlineToday: asha.isOnlineToday });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating status.' });
    }
};

exports.manageLeaveDates = async (req, res) => {
    try {
        const { leaveDates } = req.body; // Array of YYYY-MM-DD strings
        const asha = await Asha.findOne({ user: req.user._id });
        if (!asha) return res.status(404).json({ message: 'ASHA record not found' });

        // Update leave dates
        asha.leaveDates = leaveDates.map(d => new Date(d));
        await asha.save();

        // Process cancellations for all requested leave dates
        for (let dateStr of leaveDates) {
            const leaveDate = new Date(dateStr);
            leaveDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(leaveDate);
            nextDay.setDate(nextDay.getDate() + 1);

            cancelAndNotifyAppointments(req.user._id, leaveDate, nextDay, 'is on leave on this date');
        }

        res.json({ message: 'Leave dates updated successfully', leaveDates: asha.leaveDates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error managing leave dates.' });
    }
};
