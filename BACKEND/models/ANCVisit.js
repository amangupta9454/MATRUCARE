const mongoose = require('mongoose');

const ancVisitSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitWeek: { type: Number, enum: [12, 20, 28, 36], required: true },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
    notes: { type: String },
}, { timestamps: true });

// One ANC record per patient per week
ancVisitSchema.index({ patient: 1, visitWeek: 1 }, { unique: true });

module.exports = mongoose.model('ANCVisit', ancVisitSchema);
