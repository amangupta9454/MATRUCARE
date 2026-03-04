const mongoose = require('mongoose');

const healthPassportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] }, // Existing conditions
    vaccinations: [{
        name: { type: String },
        date: { type: Date }
    }],
    primaryDoctor: {
        name: { type: String },
        contact: { type: String }
    },
    insuranceProvider: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('HealthPassport', healthPassportSchema);
