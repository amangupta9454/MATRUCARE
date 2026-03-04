const User = require('../models/User');
const PregnancyProfile = require('../models/PregnancyProfile');
const BabyProfile = require('../models/BabyProfile');
const BabyVaccination = require('../models/BabyVaccination');
const Appointment = require('../models/Appointment');
const ANCVisit = require('../models/ANCVisit');

// ── GET /api/insights/advanced — Admin only ──────────────────────────────────
exports.getAdvancedInsights = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const [
            totalBirths, avgBirthWeight,
            totalVaccines, completedVaccines,
            totalAnc, completedAnc,
            monthlyBirthsRaw,
        ] = await Promise.all([
            BabyProfile.countDocuments(),
            BabyProfile.aggregate([{ $group: { _id: null, avg: { $avg: '$birthWeight' } } }]),
            BabyVaccination.countDocuments(),
            BabyVaccination.countDocuments({ completed: true }),
            ANCVisit.countDocuments(),
            ANCVisit.countDocuments({ completed: true }),
            BabyProfile.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
            ]),
        ]);

        // Build monthly birth data
        const monthlyBirths = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            const y = d.getFullYear(), m = d.getMonth() + 1;
            const found = monthlyBirthsRaw.find(r => r._id.year === y && r._id.month === m);
            monthlyBirths.push({ label: monthNames[m - 1], count: found ? found.count : 0 });
        }

        res.json({
            births: {
                total: totalBirths,
                avgBirthWeight: avgBirthWeight[0]?.avg ? Math.round(avgBirthWeight[0].avg * 100) / 100 : null,
                monthly: monthlyBirths,
            },
            vaccination: {
                total: totalVaccines,
                completed: completedVaccines,
                completionRate: totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0,
            },
            anc: {
                total: totalAnc,
                completed: completedAnc,
                completionRate: totalAnc > 0 ? Math.round((completedAnc / totalAnc) * 100) : 0,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating insights' });
    }
};

// ── GET /api/insights/export?type=pregnancies|vaccinations|appointments — Admin ──
exports.exportData = async (req, res) => {
    const { type = 'pregnancies' } = req.query;

    try {
        let rows = [];
        let headers = [];

        if (type === 'pregnancies') {
            const profiles = await PregnancyProfile.find({})
                .populate('mother', 'name email')
                .populate({ path: 'assignedDoctor', populate: { path: 'user', select: 'name' } });
            headers = ['Name', 'Email', 'Pregnancy Week', 'Risk Level', 'Risk Score', 'BMI', 'Hemoglobin', 'EDD'];
            rows = profiles.map(p => [
                p.mother?.name || '',
                p.mother?.email || '',
                p.pregnancyWeek || '',
                p.riskLevel || '',
                p.riskScore || '',
                p.bmi || '',
                p.hemoglobin || '',
                p.expectedDeliveryDate ? new Date(p.expectedDeliveryDate).toLocaleDateString('en-IN') : '',
            ]);
        } else if (type === 'vaccinations') {
            const vacs = await BabyVaccination.find({})
                .populate({ path: 'baby', populate: { path: 'mother', select: 'name email' } });
            headers = ['Baby Name', 'Mother Name', 'Mother Email', 'Vaccine', 'Due Date', 'Completed', 'Completed Date'];
            rows = vacs.map(v => [
                v.baby?.babyName || '',
                v.baby?.mother?.name || '',
                v.baby?.mother?.email || '',
                v.vaccineName || '',
                v.dueDate ? new Date(v.dueDate).toLocaleDateString('en-IN') : '',
                v.completed ? 'Yes' : 'No',
                v.completedDate ? new Date(v.completedDate).toLocaleDateString('en-IN') : '',
            ]);
        } else if (type === 'appointments') {
            const apts = await Appointment.find({})
                .populate('patient', 'name email')
                .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
            headers = ['Patient Name', 'Patient Email', 'Doctor', 'Date', 'Time', 'Mode', 'Status'];
            rows = apts.map(a => [
                a.patient?.name || '',
                a.patient?.email || '',
                a.doctor?.user?.name || '',
                a.date ? new Date(a.date).toLocaleDateString('en-IN') : '',
                a.time || '',
                a.mode || '',
                a.status || '',
            ]);
        } else {
            return res.status(400).json({ message: 'Invalid export type' });
        }

        // Build CSV
        const escape = v => `"${String(v).replace(/"/g, '""')}"`;
        const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=maacare_${type}_${Date.now()}.csv`);
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error exporting data' });
    }
};

// ── GET /api/insights/scheduler/run — Admin: manual trigger ─────────────────
exports.triggerScheduler = async (req, res) => {
    try {
        const { runDailyNotifications } = require('../utils/notificationScheduler');
        await runDailyNotifications();
        res.json({ message: 'Scheduler run completed' });
    } catch (err) {
        res.status(500).json({ message: 'Scheduler error: ' + err.message });
    }
};
