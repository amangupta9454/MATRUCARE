const mongoose = require('mongoose');

const teleConsultSchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: String },          // human-readable appointment ID e.g. AMAN-HC-2026-001
    meetingRoom: { type: String },          // Jitsi room name: maacare-{appointmentId}
    description: { type: String, required: true },
    preferredTime: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Rescheduled', 'Completed'], default: 'Pending' },
    doctorNote: { type: String },
    newTime: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('TeleConsult', teleConsultSchema);
