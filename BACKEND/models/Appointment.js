const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        mother: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed', 'Rescheduled'],
            default: 'Pending',
        },
        attachment: {
            url: String,
            public_id: String,
        },
        notes: {
            type: String,
            trim: true,
        },
        appointmentId: {
            type: String,
            unique: true,
            required: true,
        },
        patientName: {
            type: String,
            required: true,
        },
        patientEmail: {
            type: String,
            required: true,
        },
        patientMobile: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        pregnancyMonth: {
            type: Number,
        },
        previousHealthProblem: {
            type: String,
            trim: true,
        },
        mode: {
            type: String,
            enum: ['Regular Checkup', 'Testing', 'Emergency', 'Consultation'],
            default: 'Consultation',
        },
        cancellationReason: {
            type: String,
            trim: true,
        },
        rescheduleHistory: [
            {
                oldDate: Date,
                oldTime: String,
                newDate: Date,
                newTime: String,
                rescheduledAt: {
                    type: Date,
                    default: Date.now,
                },
                rescheduledBy: String, // 'Mother' or 'Doctor'
            }
        ],
        prescription: {
            url: { type: String },
            publicId: { type: String },
            notes: { type: String },
            uploadedAt: { type: Date },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
