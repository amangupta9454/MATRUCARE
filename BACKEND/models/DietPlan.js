const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    meals: [{
        category: { type: String, enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner'], required: true },
        items: [{ type: String, required: true }],
        calories: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
    }],
    totalCalories: { type: Number, default: 0 },
    adherenceScore: { type: Number, default: 0 } // Percentage of completed meals
}, { timestamps: true });

// One plan per mother per day
dietPlanSchema.index({ mother: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
