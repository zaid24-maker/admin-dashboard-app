const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a workflow name'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Failed'],
        default: 'Active'
    },
    platform: {
        type: String,
        enum: ['Shopify', 'Salesforce', 'Slack', 'Email', 'Custom'],
        default: 'Custom'
    },
    trigger: {
        type: String,
        default: 'Manual'
    },
    action: {
        type: String,
        default: 'pending' // pending, active, paused
    },
    webhookConfig: {
        url: { type: String, trim: true },
        method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'POST' },
        payload: { type: String }, // JSON stringified payload
        headers: { type: String } // JSON stringified headers
    },
    emailConfig: {
        to: { type: String, trim: true },
        subject: { type: String, trim: true },
        body: { type: String }
    },
    uiPosition: {
        type: Object,
        default: { trigger: { x: 50, y: 150 }, action: { x: 450, y: 150 } }
    },
    executionCount: {
        type: Number,
        default: 0
    },
    failedCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Workflow', workflowSchema);