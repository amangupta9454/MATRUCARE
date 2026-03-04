const mongoose = require('mongoose');

const hospitalBookingSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if unauthenticated user
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalService' }, // Optional for general consultation
    doctorId: { type: String }, // Can be doctor Name or ID
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    serviceSelected: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    notes: { type: String },
    insurancePolicyId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePolicy' },
    estimatedCost: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('HospitalBooking', hospitalBookingSchema);
