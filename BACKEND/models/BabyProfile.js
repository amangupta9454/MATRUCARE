const mongoose = require('mongoose');

const babyProfileSchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    babyName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    birthDate: { type: Date, required: true },
    birthWeight: { type: Number }, // kg
    birthHeight: { type: Number }, // cm
    bloodGroup: { type: String },
    deliveryHospital: { type: String },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    notes: { type: String },
    isPreterm: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('BabyProfile', babyProfileSchema);
