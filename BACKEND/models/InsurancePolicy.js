const mongoose = require('mongoose');

const insurancePolicySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerName: { type: String, required: true },
    policyNumber: { type: String, required: true },
    coverageAmount: { type: Number, required: true },
    coverageType: { type: String, default: 'Comprehensive' },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    documentUrl: { type: String }, // Cloudinary URL
    hospitalNetwork: { type: [String], default: [] } // List of supported hospitals or general
}, { timestamps: true });

module.exports = mongoose.model('InsurancePolicy', insurancePolicySchema);
