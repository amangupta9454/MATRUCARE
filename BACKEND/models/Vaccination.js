const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vaccineName: {
        type: String,
        enum: ['TT1', 'TT2', 'Flu Vaccine', 'COVID Booster', 'Hepatitis B'],
        required: true,
    },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
    proofUrl: { type: String },
    publicId: { type: String },
}, { timestamps: true });

vaccinationSchema.index({ patient: 1, vaccineName: 1 }, { unique: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
