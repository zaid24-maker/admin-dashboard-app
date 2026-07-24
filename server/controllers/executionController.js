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
            let isSuccess = Math.random() > 0.15;
            let overrideMessage = isSuccess ? 'Workflow executed successfully!' : 'External API timed out!';

            const sendEmail = require('../utils/email');

            // Inside runWorkflow's execution loop:
            if (workflow.action === 'Send Webhook' && workflow.webhookConfig?.url) {
                try {
                    let parsedHeaders = { 'Content-Type': 'application/json' };
                    try { if (workflow.webhookConfig.headers) Object.assign(parsedHeaders, JSON.parse(workflow.webhookConfig.headers)); } catch (e) { /* ignore parse error */ }

                    const response = await fetch(workflow.webhookConfig.url, {
                        method: workflow.webhookConfig.method || 'POST',
                        headers: parsedHeaders,
                        body: (workflow.webhookConfig.method !== 'GET' && workflow.webhookConfig.payload) ? workflow.webhookConfig.payload : undefined
                    });

                    if (response.ok) {
                        isSuccess = true;
                        overrideMessage = `Webhook success (HTTP ${response.status})`;
                    } else {
                        isSuccess = false;
                        overrideMessage = `Webhook failed (HTTP ${response.status})`;
                    }
                } catch (err) {
                    isSuccess = false;
                    overrideMessage = `Webhook error: ${err.message}`;
                }
            } else if (workflow.action === 'Send Email' && workflow.emailConfig?.to) {
                try {
                    await sendEmail({
                        to: workflow.emailConfig.to,
                        subject: workflow.emailConfig.subject || 'Automated Workflow Alert',
                        html: workflow.emailConfig.body || '<p>This is an automated workflow notification.</p>'
                    });

                    isSuccess = true;
                    overrideMessage = `Email successfully dispatched to ${workflow.emailConfig.to}`;
                } catch (err) {
                    isSuccess = false;
                    overrideMessage = `Failed to dispatch email: ${err.message}`;
                }
            }

            const endTime = Date.now();
            const duration = endTime - new Date(execution.startTime).getTime();

            await Execution.findByIdAndUpdate(execution._id, {
                status: isSuccess ? 'success' : 'failed',
                endTime,
                duration,
                result: {
                    message: overrideMessage,
                    recordsProcessed: isSuccess ? Math.floor(Math.random() * 500) + 1 : 0
                }
            });

            if (isSuccess) { workflow.executionCount += 1; }
            else { workflow.failedCount += 1; }
            await workflow.save();

            // Broadast real-time WebSockets notification to frontend dashboard!
            const io = req.app.get('io');
            if (io) {
                io.emit('execution_complete', {
                    workflowId: workflow._id,
                    workflowName: workflow.name,
                    status: isSuccess ? 'success' : 'failed',
                    message: overrideMessage,
                    duration
                });
                console.log(`[Socket] Broadcasted execution_complete for ${workflow.name}`);
            }

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
