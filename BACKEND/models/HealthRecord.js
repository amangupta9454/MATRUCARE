const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: String }, // Optional, can be Doctor ID or Name
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }, // Optional
    reportType: { type: String, required: true }, // 'Lab Report', 'Prescription', 'Vaccination', etc.
    reportUrl: { type: String, required: true }, // Cloudinary URL
    summary: { type: String }, // AI generated summary
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
