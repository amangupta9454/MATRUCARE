const mongoose = require('mongoose');

const ashaSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        region: {
            type: String,
            required: true,
            trim: true,
        },
        isApproved: {
            type: Boolean,
            default: false, // Overall platform approval if needed
        },
        isOnlineToday: {
            type: Boolean,
            default: true,
        },
        leaveDates: [{
            type: Date,
        }],
        totalServed: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
        },
        connectedDoctors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
        }],
        rejectedDoctors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Asha', ashaSchema);
