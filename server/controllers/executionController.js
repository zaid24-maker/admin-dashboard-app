const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');

exports.runWorkflow = async (req, res) => {
    try {
        const { workflowId } = req.params;
        const workflow = await Workflow.findById(workflowId);
        if (!workflow) return res.status(404).json({ error: "Workflow not found" });
        if (workflow.createdBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });

        const execution = await Execution.create({
            workflow: workflow._id,
            triggeredBy: req.user.id,
            status: 'running',
            startTime: Date.now()
        });

        setTimeout(async () => {
            const isSuccess = Math.random() > 0.15;
            const endTime = Date.now();
            const duration = endTime - new Date(execution.startTime).getTime();

            await Execution.findByIdAndUpdate(execution._id, {
                status: isSuccess ? 'success' : 'failed',
                endTime,
                duration,
                result: {
                    message: isSuccess ? 'Workflow executed successfully!' : 'External API timed out!',
                    recordsProcessed: isSuccess ? Math.floor(Math.random() * 500) + 1 : 0
                }
            });

            if (isSuccess) { workflow.executionCount += 1; }
            else { workflow.failedCount += 1; }
            await workflow.save();
        }, 2000 + Math.random() * 3000);

        res.status(202).json({ success: true, message: "Workflow queued!", data: execution });
    } catch (error) {
        res.status(500).json({ error: "Failed to initialize execution" });
    }
};

exports.getExecutions = async (req, res) => {
    try {
        const executions = await Execution.find({ triggeredBy: req.user.id })
            .populate('workflow', 'name platform')
            .sort({ startTime: -1 })
            .limit(100);
        res.status(200).json({ success: true, count: executions.length, data: executions });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch execution history" });
    }
};

exports.getExecutionById = async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id).populate('workflow', 'name platform trigger action');
        if (!execution) return res.status(404).json({ error: "Not found" });
        if (execution.triggeredBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });
        res.status(200).json({ success: true, data: execution });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteExecution = async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);
        if (!execution) return res.status(404).json({ error: "Not found" });
        if (execution.triggeredBy.toString() !== req.user.id) return res.status(401).json({ error: "Not authorized" });
        await execution.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.clearAllExecutions = async (req, res) => {
    try {
        await Execution.deleteMany({ triggeredBy: req.user.id });
        res.status(200).json({ success: true, message: "All execution logs cleared." });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
