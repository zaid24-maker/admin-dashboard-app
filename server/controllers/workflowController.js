const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalWorkflows = await Workflow.countDocuments({ createdBy: userId });
        const activeSchedules = await Workflow.countDocuments({ createdBy: userId, status: 'Active' });

        const totalExecutions = await Execution.countDocuments({ triggeredBy: userId });
        const failedExecutions = await Execution.countDocuments({ triggeredBy: userId, status: 'failed' });

        const durationAgg = await Execution.aggregate([
            { $match: { triggeredBy: new mongoose.Types.ObjectId(userId), status: 'success' } },
            { $group: { _id: null, avgTime: { $avg: "$duration" } } }
        ]);
        const avgTimeMs = durationAgg.length > 0 && durationAgg[0].avgTime ? durationAgg[0].avgTime : 0;
        const avgTimeForm = avgTimeMs ? (avgTimeMs / 1000).toFixed(1) + 's' : '0s';

        let successRateStr = "0%";
        if (totalExecutions > 0) {
            const rate = ((totalExecutions - failedExecutions) / totalExecutions) * 100;
            successRateStr = rate.toFixed(1) + "%";
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const trends = await Execution.aggregate([
            { $match: { triggeredBy: new mongoose.Types.ObjectId(userId), startTime: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    executions: { $sum: 1 },
                    failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = trends.find(t => t._id === dateStr);
            chartData.push({
                name: days[d.getDay()],
                executions: found ? found.executions : 0,
                failed: found ? found.failed : 0
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalWorkflows,
                activeSchedules,
                totalExecutions,
                failedExecutions,
                successRate: successRateStr,
                avgTime: avgTimeForm,
                chartData
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Server error fetching stats" });
    }
};

exports.createWorkflow = async (req, res) => {
    try {
        const { name, platform, trigger, action, webhookConfig, emailConfig } = req.body;

        const newWorkflow = await Workflow.create({
            name,
            platform,
            trigger,
            action,
            webhookConfig,
            emailConfig,
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