const File = require('../models/File');
const fs = require('fs');
const path = require('path');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No physical file was safely uploaded" });
        }
        const newFile = await File.create({
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user.id
        });
        res.status(201).json({ success: true, data: newFile });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Server completely failed to securely mathematically process the file" });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const files = await File.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch files" });
    }
};

exports.updateFile = async (req, res) => {
    try {
        let file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ error: "Not found" });
        if (file.uploadedBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });

        file = await File.findByIdAndUpdate(req.params.id, { originalName: req.body.originalName }, { new: true });
        res.status(200).json({ success: true, data: file });
    } catch (error) {
        res.status(500).json({ error: "Server Error updating file" });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const dbFile = await File.findById(req.params.id);
        if (!dbFile) return res.status(404).json({ error: "Not found" });
        if (dbFile.uploadedBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });

        const filePath = path.join(__dirname, '../uploads', dbFile.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await dbFile.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ error: "Server Error deleting file" });
    }
};