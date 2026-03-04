const mongoose = require('mongoose');

const ashaAssignmentSchema = new mongoose.Schema({
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    region: { type: String, required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date, default: Date.now },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AshaAssignment', ashaAssignmentSchema);
