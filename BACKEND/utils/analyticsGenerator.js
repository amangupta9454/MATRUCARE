const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const PregnancyProfile = require('../models/PregnancyProfile');
const ANCVisit = require('../models/ANCVisit');
const AshaAssignment = require('../models/AshaAssignment');

/**
 * Generate full analytics stats for the admin dashboard
 */
const generateAnalytics = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
        totalMothers, totalDoctors, totalAsha, totalAppointments,
        highRiskCount, mediumRiskCount, lowRiskCount,
        monthlyRaw, ancTotal, ancCompleted,
    ] = await Promise.all([
        User.countDocuments({ role: 'Mother' }),
        User.countDocuments({ role: 'Doctor' }),
        User.countDocuments({ role: 'ASHA' }),
        Appointment.countDocuments(),
        PregnancyProfile.countDocuments({ riskLevel: 'High' }),
        PregnancyProfile.countDocuments({ riskLevel: 'Medium' }),
        PregnancyProfile.countDocuments({ riskLevel: 'Low' }),
        // Monthly appointment counts for last 6 months
        Appointment.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        ANCVisit.countDocuments(),
        ANCVisit.countDocuments({ completed: true }),
    ]);

    // Build monthly labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const found = monthlyRaw.find(r => r._id.year === y && r._id.month === m);
        monthlyData.push({ label: monthNames[m - 1], count: found ? found.count : 0 });
    }

    return {
        totals: { mothers: totalMothers, doctors: totalDoctors, ashaWorkers: totalAsha, appointments: totalAppointments },
        riskDistribution: { high: highRiskCount, medium: mediumRiskCount, low: lowRiskCount },
        monthlyAppointments: monthlyData,
        ancCompletionRate: ancTotal > 0 ? Math.round((ancCompleted / ancTotal) * 100) : 0,
    };
};

module.exports = { generateAnalytics };
