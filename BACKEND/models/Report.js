const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    reportName: { type: String, required: true },
    reportType: {
        type: String,
        enum: ['Blood Test', 'Ultrasound', 'Urine Test', 'Hemoglobin', 'Blood Pressure', 'Other'],
        default: 'Other',
    },
    reportUrl: { type: String, required: true },
    publicId: { type: String },
    uploadDate: { type: Date, default: Date.now },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
