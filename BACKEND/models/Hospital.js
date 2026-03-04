const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    hospitalName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    hospitalLicense: { type: String, required: true },
    numberOfBeds: { type: Number, required: true },
    specialties: [{ type: String }],
    hospitalDescription: { type: String },
    logo: { type: String }, // Cloudinary URL
    doctors: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        doctorName: String,
        specialization: String,
        experience: Number,
        qualification: String,
        gender: String,
        profileImage: String,
        contactNumber: String,
        availabilitySchedule: [{
            day: String,
            slots: [{
                time: String,
                isBlocked: { type: Boolean, default: false }
            }],
            isBlocked: { type: Boolean, default: false }
        }]
    }],
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
