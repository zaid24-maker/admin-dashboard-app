const Workflow = require('../models/Workflow');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalWorkflows = await Workflow.countDocuments({ createdBy: userId });
        const activeSchedules = await Workflow.countDocuments({ createdBy: userId, status: 'Active' });

        const simulatedExecutions = totalWorkflows * 142;
        const simulatedFails = totalWorkflows > 0 ? Math.floor(simulatedExecutions * 0.05) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalWorkflows,
                activeSchedules,
                totalExecutions: simulatedExecutions,
                failedExecutions: simulatedFails,
                successRate: totalWorkflows === 0 ? "0%" : "95.0%",
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Server error fetching stats" });
    }
};

exports.createWorkflow = async (req, res) => {
    try {
        const { name, platform, trigger, action } = req.body;

        const newWorkflow = await Workflow.create({
            name,
            platform,
            trigger,
            action,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: newWorkflow });
    } catch (error) {
        res.status(500).json({ error: "Failed to create workflow" });
    }
};

exports.getWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: workflows });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch workflows" });
    }
};

exports.getWorkflowById = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Not found" });
        if (workflow.createdBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });

        res.status(200).json({ success: true, data: workflow });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

exports.updateWorkflow = async (req, res) => {
    try {
        let workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Not found" });
        if (workflow.createdBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });

        workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: workflow });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

exports.deleteWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Not found" });
        if (workflow.createdBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });

        await workflow.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};