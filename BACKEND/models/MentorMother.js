const mongoose = require('mongoose');

const mentorMotherSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who is a mentor
    name: { type: String, required: true },
    expertiseTopics: [{ type: String }], // 'pregnancy care', 'postpartum recovery', etc.
    bio: { type: String },
    experienceYears: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MentorMother', mentorMotherSchema);
