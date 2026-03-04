const mongoose = require('mongoose');

const pregnancyProfileSchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    age: { type: Number, required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg
    bmi: { type: Number },
    pregnancyWeek: { type: Number, required: true, min: 1, max: 42 },
    expectedDeliveryDate: { type: Date, required: true },
    miscarriageHistory: { type: Boolean, default: false },
    diabetes: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false },
    hemoglobin: { type: Number }, // g/dL — optional, may not be available at home
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    riskFactors: [{ type: String }],
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    emergencyContact: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        relation: { type: String },
    },
}, { timestamps: true });

// Auto-calculate BMI before save (async hook — no 'next' needed in modern Mongoose)
pregnancyProfileSchema.pre('save', async function () {
    if (this.height && this.weight) {
        const heightM = this.height / 100;
        this.bmi = parseFloat((this.weight / (heightM * heightM)).toFixed(1));
    }
});

module.exports = mongoose.model('PregnancyProfile', pregnancyProfileSchema);
