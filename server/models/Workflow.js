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
        default: 'Log Data'
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