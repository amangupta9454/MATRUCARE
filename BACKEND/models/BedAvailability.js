const mongoose = require('mongoose');

const bedAvailabilitySchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, unique: true },
    generalBeds: {
        total: { type: Number, default: 0 },
        occupied: { type: Number, default: 0 }
    },
    deliveryBeds: {
        total: { type: Number, default: 0 },
        occupied: { type: Number, default: 0 }
    },
    ICUBeds: {
        total: { type: Number, default: 0 },
        occupied: { type: Number, default: 0 }
    },
    emergencyBeds: {
        total: { type: Number, default: 0 },
        occupied: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('BedAvailability', bedAvailabilitySchema);
