const mongoose = require('mongoose');

const globalFeedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    feedbackType: { type: String, enum: ['Project', 'Doctor', 'Facility'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' }, // Optional target (Doctor/Hospital)
    targetModel: { type: String, enum: ['Doctor', 'Hospital'], select: false },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('GlobalFeedback', globalFeedbackSchema);
