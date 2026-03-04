const TeleConsult = require('../models/TeleConsult');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const sendEmail = require('../config/nodemailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://matrucare-ai.netlify.app';

// ── Helper: generate Jitsi room name ─────────────────────────────────────────
const generateRoom = (appointmentId, consultId) =>
    'maacare-' + (appointmentId || consultId).replace(/\s+/g, '-').toLowerCase();

// ── Mother: Request tele-consultation ────────────────────────────────────────
exports.requestTeleConsult = async (req, res) => {
    try {
        const { doctorId, description, preferredTime, appointmentId } = req.body;

        const doctor = await Doctor.findById(doctorId).populate('user', 'name email');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const consult = await TeleConsult.create({
            mother: req.user._id,
            doctor: doctorId,
            description,
            preferredTime: new Date(preferredTime),
            appointmentId: appointmentId || '',
            meetingRoom: generateRoom(appointmentId, 'pending'),
        });

        // Update meetingRoom now that we have the consult _id
        if (!appointmentId) {
            consult.meetingRoom = generateRoom(null, consult._id.toString());
            await consult.save();
        }

        await sendEmail({
            to: doctor.user.email,
            subject: `MaaCare — New Tele-Consultation Request from ${req.user.name}`,
            html: `<div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid #6366f1;">
              <h2 style="color:#6366f1;">📞 New Tele-Consultation Request</h2>
              <p><strong>Patient:</strong> ${req.user.name} (${req.user.email})</p>
              ${appointmentId ? `<p><strong>Appointment ID:</strong> ${appointmentId}</p>` : ''}
              <p><strong>Preferred Time:</strong> ${new Date(preferredTime).toLocaleString('en-IN')}</p>
              <p><strong>Description:</strong></p>
              <div style="background:#f5f3ff;padding:12px;border-radius:8px;margin:8px 0;">${description}</div>
              <p>Log in to <strong>MaaCare → Doctor Dashboard → Tele-Consult</strong> to accept, reject, or suggest a new time.</p>
            </div>`,
        });

        res.status(201).json(consult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error requesting tele-consultation' });
    }
};

// ── Mother: Get own tele-consult requests ────────────────────────────────────
exports.getMyTeleConsults = async (req, res) => {
    try {
        const consults = await TeleConsult.find({ mother: req.user._id })
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name email profileImage' } })
            .sort('-createdAt');
        res.json(consults);
    } catch (err) { res.status(500).json({ message: 'Error fetching tele-consults' }); }
};

// ── Doctor: Get tele-consult requests for them ───────────────────────────────
exports.getDoctorTeleConsults = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const consults = await TeleConsult.find({ doctor: doctor._id })
            .populate('mother', 'name email profileImage')
            .sort('-createdAt');
        res.json(consults);
    } catch (err) { res.status(500).json({ message: 'Error fetching tele-consults' }); }
};

// ── Doctor: Update status of tele-consult ────────────────────────────────────
exports.updateTeleConsult = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, doctorNote, newTime } = req.body;

        const consult = await TeleConsult.findById(id)
            .populate('mother', 'name email')
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
        if (!consult) return res.status(404).json({ message: 'Tele-consult not found' });

        // Verify doctor owns this consult
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || consult.doctor._id.toString() !== doctor._id.toString()) {
            return res.status(403).json({ message: 'Not authorised' });
        }

        // When accepting, ensure meetingRoom is solidified
        if (status === 'Accepted' && !consult.meetingRoom) {
            consult.meetingRoom = generateRoom(consult.appointmentId, consult._id.toString());
        }

        consult.status = status;
        if (doctorNote) consult.doctorNote = doctorNote;
        if (newTime) consult.newTime = new Date(newTime);
        await consult.save();

        const jitsiLink = `https://meet.jit.si/${consult.meetingRoom}`;
        const roomPath = `${FRONTEND_URL}/teleconsult/room/${consult._id}`;

        const statusColors = { Accepted: '#16a34a', Rejected: '#dc2626', Rescheduled: '#d97706', Completed: '#6366f1' };
        const color = statusColors[status] || '#6366f1';

        let emailBody = `<div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid ${color};">
          <h2 style="color:${color};">📞 Tele-Consultation ${status}</h2>
          <p>Dear <strong>${consult.mother.name}</strong>,</p>
          <p>Dr. <strong>${consult.doctor?.user?.name}</strong> has <strong>${status.toLowerCase()}</strong> your tele-consultation request.</p>`;

        if (consult.appointmentId) emailBody += `<p><strong>Appointment ID:</strong> ${consult.appointmentId}</p>`;

        if (status === 'Accepted') {
            emailBody += `
          <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:12px 0;border:1px solid #86efac;">
            <p style="margin:0;font-weight:bold;color:#16a34a;">🎥 Your Meeting is Ready!</p>
            <p style="margin:8px 0;">Click the button below to join your video consultation:</p>
            <a href="${roomPath}" style="display:inline-block;background:#16a34a;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Join Meeting in MaaCare</a>
            <p style="margin:8px 0;font-size:12px;color:#666;">Or join directly via Jitsi: <a href="${jitsiLink}">${jitsiLink}</a></p>
          </div>`;
        }

        if (status === 'Rescheduled' && newTime)
            emailBody += `<p><strong>New Suggested Time:</strong> ${new Date(newTime).toLocaleString('en-IN')}</p>`;
        if (doctorNote)
            emailBody += `<p><strong>Doctor's Note:</strong> ${doctorNote}</p>`;

        emailBody += `<p>Log in to <a href="${FRONTEND_URL}">MaaCare</a> to manage your consultations.</p></div>`;

        await sendEmail({ to: consult.mother.email, subject: `MaaCare — Tele-Consultation ${status}`, html: emailBody });

        res.json(consult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating tele-consult' });
    }
};

// ── Verify room access before joining (Mother or Doctor) ─────────────────────
exports.verifyRoomAccess = async (req, res) => {
    try {
        const consult = await TeleConsult.findById(req.params.consultId)
            .populate({ path: 'doctor', select: 'user' });
        if (!consult) return res.status(404).json({ message: 'Consultation not found' });

        if (consult.status !== 'Accepted') {
            return res.status(403).json({ message: 'Meeting is not active. Consultation must be Accepted first.' });
        }

        const userId = req.user._id.toString();
        const isMother = consult.mother.toString() === userId;
        const isDoctor = consult.doctor?.user?.toString() === userId;

        if (!isMother && !isDoctor) {
            return res.status(403).json({ message: 'You are not a participant in this consultation.' });
        }

        res.json({
            meetingRoom: consult.meetingRoom,
            jitsiUrl: `https://meet.jit.si/${consult.meetingRoom}`,
            appointmentId: consult.appointmentId,
            status: consult.status,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error verifying room access' });
    }
};
