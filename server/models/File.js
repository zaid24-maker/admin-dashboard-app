const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    filename: { type: String, required: true },     // The securely randomized name we save it under
    mimeType: { type: String, required: true },     // Tells us if it's CSV, JSON, PNG, etc.
    size: { type: Number, required: true },         // Size precisely tracking locally in bytes
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);