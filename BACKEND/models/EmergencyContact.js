const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, references a doctor
    doctorName: { type: String },
    doctorPhone: { type: String },
    familyContact: {
        name: { type: String },
        phone: { type: String }
    },
    ashaWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
    ashaWorkerName: { type: String },
    ashaWorkerPhone: { type: String },
    phoneNumber: { type: String } // General default emergency number
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
