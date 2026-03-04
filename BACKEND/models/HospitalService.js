const mongoose = require('mongoose');

const hospitalServiceSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    serviceName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    doctorAssigned: { type: String }, // Can be doctor Name or ID
    availableSlots: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('HospitalService', hospitalServiceSchema);
