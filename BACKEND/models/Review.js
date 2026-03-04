const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

// One review per appointment
reviewSchema.index({ doctor: 1, appointment: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
