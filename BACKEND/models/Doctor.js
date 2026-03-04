const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        specialization: {
            type: String,
            required: true,
        },
        license: {
            url: String,
            public_id: String,
        },
        availability: {
            // Ex: ['Monday 10AM-2PM', 'Wednesday 2PM-6PM']
            type: [String],
            default: [],
        },
        bio: {
            type: String,
            trim: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            url: String,
            public_id: String,
        },
        qualifications: {
            type: [String],
            default: [],
        },
        experienceYears: {
            type: Number,
            default: 0,
        },
        fieldOfExperience: {
            type: String,
        },
        specialistType: {
            type: String, // e.g., 'Gynecologist', 'Pediatrician'
        },
        previousOrganizations: {
            type: [String],
            default: [],
        },
        currentOrganization: {
            type: String,
        },
        mobile: {
            type: String,
        },
        consultationFee: {
            type: Number,
            default: 0,
        },
        availableDays: {
            type: [String],
            default: [], // e.g., ['Monday', 'Tuesday']
        },
        availableSlots: {
            type: [String],
            default: [], // e.g., ['10:00 AM - 12:00 PM', '02:00 PM - 04:00 PM']
        },
        isListed: {
            type: Boolean,
            default: false,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Other',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
