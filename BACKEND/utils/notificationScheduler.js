const sendEmail = require('../config/nodemailer');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ANCVisit = require('../models/ANCVisit');
const Medicine = require('../models/Medicine');
const BabyVaccination = require('../models/BabyVaccination');
const BabyProfile = require('../models/BabyProfile');
const PregnancyProfile = require('../models/PregnancyProfile');

// ── Email template helper ────────────────────────────────────────────────────
const reminderEmail = (title, body) => `
<div style="font-family:Arial,sans-serif;padding:24px;max-width:600px;border-left:4px solid #008080;">
  <h2 style="color:#008080;">🔔 MaaCare Reminder</h2>
  <h3 style="margin-top:0">${title}</h3>
  <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:12px 0;">${body}</div>
  <p style="color:#718096;font-size:12px;">This is an automated reminder from MaaCare. Please do not reply to this email.</p>
</div>`;

// ── Appointment reminder (day before) ────────────────────────────────────────
const sendAppointmentReminders = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow); start.setHours(0, 0, 0, 0);
    const end = new Date(tomorrow); end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
        date: { $gte: start, $lte: end },
        status: { $in: ['Approved', 'Pending'] }
    }).populate('patient', 'name email').populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    for (const apt of appointments) {
        if (!apt.patient?.email) continue;
        await sendEmail({
            to: apt.patient.email,
            subject: '🔔 MaaCare — Appointment Reminder (Tomorrow)',
            html: reminderEmail(
                'Appointment Tomorrow',
                `<p>You have an appointment scheduled for <strong>tomorrow, ${new Date(apt.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong> at <strong>${apt.time}</strong>.</p>
                 <p>Doctor: <strong>Dr. ${apt.doctor?.user?.name || 'your doctor'}</strong></p>
                 <p>Please arrive on time or reschedule through the MaaCare app if needed.</p>`
            ),
        });
    }
    return appointments.length;
};

// ── ANC visit reminder (due within 7 days) ───────────────────────────────────
const sendAncReminders = async () => {
    const profiles = await PregnancyProfile.find({}).populate('mother', 'name email');
    let count = 0;

    for (const profile of profiles) {
        const pending = await ANCVisit.find({ patient: profile.mother._id, completed: false });
        // ANC visits are week-based; estimate if current week + 1 is a pending visit
        const nextWeek = profile.pregnancyWeek + 1;
        const dueSoon = pending.find(v => v.visitWeek >= profile.pregnancyWeek && v.visitWeek <= nextWeek + 7);
        if (!dueSoon || !profile.mother?.email) continue;

        await sendEmail({
            to: profile.mother.email,
            subject: '🔔 MaaCare — ANC Visit Due Soon',
            html: reminderEmail(
                `ANC Visit Due — Week ${dueSoon.visitWeek}`,
                `<p>Dear <strong>${profile.mother.name}</strong>,</p>
                 <p>Your <strong>Antenatal Care (ANC) visit for Week ${dueSoon.visitWeek}</strong> is coming up soon.</p>
                 <p>Please schedule an appointment with your doctor or visit your nearest health centre.</p>`
            ),
        });
        count++;
    }
    return count;
};

// ── Medicine reminder (active medicines) ─────────────────────────────────────
const sendMedicineReminders = async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const medicines = await Medicine.find({
        active: true,
        endDate: { $gte: today, $lte: tomorrow },
    }).populate('patient', 'name email');

    for (const med of medicines) {
        if (!med.patient?.email) continue;
        await sendEmail({
            to: med.patient.email,
            subject: '🔔 MaaCare — Medicine Reminder',
            html: reminderEmail(
                'Medicine Reminder',
                `<p>Dear <strong>${med.patient.name}</strong>,</p>
                 <p>Your prescription for <strong>${med.medicineName}</strong> (${med.dosage}, ${med.frequency}) ends tomorrow.</p>
                 <p>Please consult your doctor if you need a refill.</p>`
            ),
        });
    }
    return medicines.length;
};

// ── Baby vaccination reminder (due within 7 days) ────────────────────────────
const sendBabyVaccineReminders = async () => {
    const now = new Date();
    const sevenDays = new Date(now); sevenDays.setDate(sevenDays.getDate() + 7);

    const vaccines = await BabyVaccination.find({
        completed: false,
        dueDate: { $gte: now, $lte: sevenDays },
    }).populate({ path: 'baby', populate: { path: 'mother', select: 'name email' } });

    for (const vac of vaccines) {
        const email = vac.baby?.mother?.email;
        if (!email) continue;
        await sendEmail({
            to: email,
            subject: `🔔 MaaCare — Baby Vaccination Due: ${vac.vaccineName}`,
            html: reminderEmail(
                `Baby Vaccination Due — ${vac.vaccineName}`,
                `<p>The <strong>${vac.vaccineName}</strong> vaccination for <strong>${vac.baby?.babyName}</strong> is due on <strong>${new Date(vac.dueDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>.</p>
                 <p>Please visit your nearest health centre or child specialist to get this done on time.</p>`
            ),
        });
    }
    return vaccines.length;
};

// ── Master scheduler — runs all checks ──────────────────────────────────────
const runDailyNotifications = async () => {
    console.log('[Scheduler] Running daily notifications at', new Date().toLocaleString('en-IN'));
    try {
        const [apts, anc, meds, vax] = await Promise.all([
            sendAppointmentReminders(),
            sendAncReminders(),
            sendMedicineReminders(),
            sendBabyVaccineReminders(),
        ]);
        console.log(`[Scheduler] Sent: ${apts} appointment, ${anc} ANC, ${meds} medicine, ${vax} baby vaccine reminders`);
    } catch (err) {
        console.error('[Scheduler] Error:', err.message);
    }
};

// ── Start cron if node-cron is available ────────────────────────────────────
const startScheduler = () => {
    try {
        const cron = require('node-cron');
        // Every day at 8:00 AM IST
        cron.schedule('0 8 * * *', runDailyNotifications, { timezone: 'Asia/Kolkata' });
        console.log('[Scheduler] Daily notification scheduler started (8:00 AM IST)');
    } catch (e) {
        console.warn('[Scheduler] node-cron not installed — scheduler disabled. Run: npm install node-cron');
    }
};

module.exports = { startScheduler, runDailyNotifications };
