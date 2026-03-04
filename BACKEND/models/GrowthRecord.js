const mongoose = require('mongoose');

const growthRecordSchema = new mongoose.Schema({
    baby: { type: mongoose.Schema.Types.ObjectId, ref: 'BabyProfile', required: true },
    weight: { type: Number }, // kg
    height: { type: Number }, // cm
    headCircumference: { type: Number }, // cm
    recordedDate: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('GrowthRecord', growthRecordSchema);
