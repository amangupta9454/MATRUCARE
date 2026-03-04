const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g. "Twice daily", "Every 8 hours"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
