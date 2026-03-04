const GlobalFeedback = require('../models/GlobalFeedback');

// ── SUBMIT FEEDBACK ───────────────────────────────────────────────────────────
exports.submitFeedback = async (req, res) => {
    try {
        const { feedbackType, targetId, rating, comment } = req.body;

        let targetModel = undefined;
        if (feedbackType === 'Doctor') targetModel = 'Doctor';
        if (feedbackType === 'Facility') targetModel = 'Hospital';

        const feedback = await GlobalFeedback.create({
            user: req.user._id,
            feedbackType,
            targetId,
            targetModel,
            rating,
            comment
        });

        // Populate user for instant frontend display
        await feedback.populate('user', 'name profileImage role');

        res.status(201).json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting feedback' });
    }
};

// ── GET ALL PUBLIC FEEDBACK ───────────────────────────────────────────────────
exports.getAllFeedback = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const [feedbacks, total] = await Promise.all([
            GlobalFeedback.find()
                .populate('user', 'name profileImage role')
                .populate('targetId', 'user name facilityName') // 'name' for Hospital, 'user' for Doctor
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            GlobalFeedback.countDocuments()
        ]);

        res.json({ feedbacks, total, page, limit });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching feedback' });
    }
};

// ── ADMIN: DELETE FEEDBACK ────────────────────────────────────────────────────
exports.deleteFeedback = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Not authorized' });
        await GlobalFeedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting feedback' });
    }
};
