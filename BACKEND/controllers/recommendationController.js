const Doctor = require('../models/Doctor');
const Review = require('../models/Review');
const { computeScore, getBadge } = require('../utils/doctorRanking');

// ── GET /api/recommendations ──────────────────────────────────────────────────
// Query params: specialization, gender, location (all optional)
exports.getRecommendations = async (req, res) => {
    try {
        const { specialization, gender, location } = req.query;

        const filter = { isListed: true };
        if (specialization && specialization !== 'All') {
            filter.$or = [
                { specialistType: new RegExp(specialization, 'i') },
                { specialization: new RegExp(specialization, 'i') },
                { fieldOfExperience: new RegExp(specialization, 'i') },
            ];
        }
        if (gender && gender !== 'Any') filter.gender = gender;
        if (location) filter.currentOrganization = new RegExp(location, 'i');

        const doctors = await Doctor.find(filter)
            .populate('user', 'name email profileImage')
            .lean();

        // Fetch review stats for all doctors in one aggregation
        const mongoose = require('mongoose');
        const ids = doctors.map(d => d._id);
        const reviewAgg = await Review.aggregate([
            { $match: { doctor: { $in: ids } } },
            { $group: { _id: '$doctor', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        const statsMap = {};
        reviewAgg.forEach(r => { statsMap[r._id.toString()] = { avgRating: +r.avg.toFixed(1), reviewCount: r.count }; });

        // Score + badge each doctor
        const scored = doctors.map(d => {
            const stats = statsMap[d._id.toString()] || { avgRating: 0, reviewCount: 0 };
            const score = computeScore(d, stats);
            return { ...d, ...stats, score, badge: getBadge(score) };
        });

        // Sort: gender preference first (if provided), then by score desc
        scored.sort((a, b) => {
            if (gender && gender !== 'Any') {
                // preferred gender already filtered; just sort by score
            }
            return b.score - a.score;
        });

        res.json(scored);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
};
