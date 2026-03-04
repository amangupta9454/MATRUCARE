const generateJourney = require('../utils/healthJourneyGenerator');

exports.getNavigationJourney = async (req, res) => {
    try {
        const { condition } = req.query; // e.g., 'Anemia', 'Diabetes'

        if (!condition) {
            return res.status(400).json({ success: false, message: 'Condition parameter is required.' });
        }

        const journey = generateJourney(condition);
        res.status(200).json({ success: true, journey });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
