const mongoose = require('mongoose');

const STANDARD_VACCINES = [
    { name: 'BCG', dueWeeks: 0 },
    { name: 'OPV-0', dueWeeks: 0 },
    { name: 'Hepatitis B', dueWeeks: 0 },
    { name: 'OPV-1', dueWeeks: 6 },
    { name: 'DPT-1', dueWeeks: 6 },
    { name: 'Hib-1', dueWeeks: 6 },
    { name: 'OPV-2', dueWeeks: 10 },
    { name: 'DPT-2', dueWeeks: 10 },
    { name: 'Hib-2', dueWeeks: 10 },
    { name: 'OPV-3', dueWeeks: 14 },
    { name: 'DPT-3', dueWeeks: 14 },
    { name: 'Hib-3', dueWeeks: 14 },
    { name: 'Measles', dueWeeks: 36 },
    { name: 'MMR', dueWeeks: 52 },
];

const babyVaccinationSchema = new mongoose.Schema({
    baby: { type: mongoose.Schema.Types.ObjectId, ref: 'BabyProfile', required: true },
    vaccineName: { type: String, required: true },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
    proofUrl: { type: String },
    proofPublicId: { type: String },
}, { timestamps: true });

babyVaccinationSchema.index({ baby: 1, vaccineName: 1 }, { unique: true });

module.exports = mongoose.model('BabyVaccination', babyVaccinationSchema);
module.exports.STANDARD_VACCINES = STANDARD_VACCINES;
