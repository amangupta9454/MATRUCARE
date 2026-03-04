const MentorMother = require('../models/MentorMother');

exports.registerMentor = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, expertiseTopics, bio, experienceYears } = req.body;

        // Single user can only be one mentor
        let mentor = await MentorMother.findOne({ userId });
        if (mentor) return res.status(400).json({ success: false, message: 'You are already registered as a mentor.' });

        mentor = new MentorMother({ userId, name, expertiseTopics, bio, experienceYears });
        await mentor.save();

        res.status(201).json({ success: true, message: 'Successfully registered as a mentor', mentor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMentors = async (req, res) => {
    try {
        const mentors = await MentorMother.find({ isActive: true }).select('-__v');
        res.status(200).json({ success: true, mentors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const mentor = await MentorMother.findOneAndUpdate({ userId }, updates, { new: true });
        if (!mentor) return res.status(404).json({ success: false, message: 'Mentor profile not found' });

        res.status(200).json({ success: true, message: 'Profile updated', mentor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
