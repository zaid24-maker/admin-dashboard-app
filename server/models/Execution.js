const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
    workflow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow',
        required: true
    },
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'success', 'failed'],
        default: 'pending'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number // In milliseconds
    },
    result: {
        type: Object, // Execution output/summary
        default: {}
    }
}, { timestamps: true });

// Compound index for extremely fast history queries seamlessly checking workflow logic!
executionSchema.index({ workflow: 1, startTime: -1 });

module.exports = mongoose.model('Execution', executionSchema);
