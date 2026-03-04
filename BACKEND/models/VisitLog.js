const mongoose = require('mongoose');

const visitLogSchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitDate: { type: Date, required: true, default: Date.now },
    bloodPressure: { type: String }, // e.g. "120/80"
    weight: { type: Number }, // kg
    hemoglobin: { type: Number }, // g/dL
    observations: { type: String },
    recommendations: { type: String },
    nextVisitDate: { type: Date },
    syncedFromOffline: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('VisitLog', visitLogSchema);
