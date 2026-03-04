const mongoose = require('mongoose');

const schemeEligibilitySchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputData: { type: Object }, // form inputs snapshot
    results: [
        {
            schemeName: String,
            eligible: Boolean,
            benefits: [String],
            documents: [String],
            steps: [String],
            officialLink: String,
        }
    ],
    checkedDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SchemeEligibility', schemeEligibilitySchema);
