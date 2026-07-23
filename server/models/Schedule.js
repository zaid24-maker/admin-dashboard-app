const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], default: 'daily' },
    cronExpression: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    nextRun: { type: Date },
    lastRun: { type: Date },
}, { timestamps: true });

scheduleSchema.index({ nextRun: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
