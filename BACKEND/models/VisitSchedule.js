const mongoose = require('mongoose');

const visitScheduleSchema = new mongoose.Schema({
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Changed to User ref as doctor may be a User ID
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., '10:00 AM'
    location: { type: String }, // General region or address
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    travelTimeFromPrevious: { type: String, default: '15 mins' }
}, { timestamps: true });

module.exports = mongoose.model('VisitSchedule', visitScheduleSchema);
