const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    completedQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion' }],
    streakDays: { type: Number, default: 0 },
    lastQuizDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
