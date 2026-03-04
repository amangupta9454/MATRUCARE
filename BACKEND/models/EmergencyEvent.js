const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
    resolvedStatus: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
