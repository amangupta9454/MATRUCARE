const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
    category: { type: String, enum: ['Nutrition', 'Postnatal Care', 'Baby Care', 'Mental Health'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true },
    points: { type: Number, default: 10 }
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
