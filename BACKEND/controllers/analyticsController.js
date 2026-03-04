const { generateAnalytics } = require('../utils/analyticsGenerator');
const PregnancyProfile = require('../models/PregnancyProfile');
const User = require('../models/User');

// GET /api/analytics/stats — Admin only
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await generateAnalytics();
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating analytics' });
    }
};

// GET /api/analytics/heatmap — Admin only
// Returns all pregnancy profiles with location info for heatmap
exports.getRiskHeatmapData = async (req, res) => {
    try {
        // Get profiles with location from emergency events if available
        const profiles = await PregnancyProfile.find({})
            .populate('mother', 'name email')
            .select('riskLevel riskScore pregnancyWeek mother');

        // For heatmap display, we return risk data (lat/lon would come from EmergencyEvent if available)
        const EmergencyEvent = require('../models/EmergencyEvent');
        const events = await EmergencyEvent.find({ latitude: { $ne: null } })
            .populate('mother', 'name')
            .select('mother latitude longitude riskScore pregnancyWeek createdAt');

        // Map profiles to heatmap points using latest emergency event per mother
        const heatmapPoints = events.map(ev => {
            const profile = profiles.find(p => p.mother?._id?.toString() === ev.mother?._id?.toString());
            return {
                name: ev.mother?.name,
                lat: ev.latitude,
                lon: ev.longitude,
                riskLevel: profile?.riskLevel || 'Low',
                riskScore: ev.riskScore || profile?.riskScore || 0,
                pregnancyWeek: ev.pregnancyWeek || profile?.pregnancyWeek,
            };
        });

        res.json({
            profiles: profiles.map(p => ({
                name: p.mother?.name,
                riskLevel: p.riskLevel,
                riskScore: p.riskScore,
                pregnancyWeek: p.pregnancyWeek,
            })),
            heatmapPoints,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching heatmap data' });
    }
};
