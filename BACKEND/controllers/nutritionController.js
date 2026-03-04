const PregnancyProfile = require('../models/PregnancyProfile');
const { generateNutrition } = require('../utils/nutritionGenerator');

// GET /api/health/nutrition
exports.getNutritionPlan = async (req, res) => {
    try {
        const profile = await PregnancyProfile.findOne({ mother: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Please create your pregnancy profile first to get a nutrition plan.' });
        }

        const week = profile.pregnancyWeek;
        const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;

        const plan = generateNutrition({
            trimester,
            bmi: profile.bmi,
            hemoglobin: profile.hemoglobin,
            riskLevel: profile.riskLevel,
        });

        res.json({ ...plan, pregnancyWeek: week, trimester });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating nutrition plan' });
    }
};
