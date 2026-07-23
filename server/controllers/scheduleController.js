const Schedule = require('../models/Schedule');
const cron = require('node-cron');

// Lazy-load to avoid circular dependency
const getRunWorkflow = () => require('./executionController').runWorkflow;

// In-memory map of active cron tasks keyed by schedule ID string
const activeTasks = {};

const getCronExpression = (frequency) => {
    switch (frequency) {
        case 'daily': return '0 9 * * *';
        case 'weekly': return '0 9 * * 1';
        case 'monthly': return '0 9 1 * *';
        default: return null;
    }
};

const getNextRun = (cronExp) => {
    const now = new Date();
    const next = new Date(now);
    next.setSeconds(0);
    next.setMilliseconds(0);
    const parts = cronExp.split(' ');
    next.setHours(parseInt(parts[1]) || 9);
    next.setMinutes(parseInt(parts[0]) || 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
};

const startCronJob = (schedule) => {
    const idStr = schedule._id.toString();
    if (activeTasks[idStr]) {
        activeTasks[idStr].stop();
    }
    if (!cron.validate(schedule.cronExpression)) {
        console.warn(`[CRON] Invalid expression for schedule ${idStr}: ${schedule.cronExpression}`);
        return;
    }
    const task = cron.schedule(schedule.cronExpression, async () => {
        console.log(`[CRON] Auto-running workflow: ${schedule.workflow}`);
        const runWorkflow = getRunWorkflow();
        const mockReq = {
            params: { workflowId: schedule.workflow.toString() },
            user: { id: schedule.createdBy.toString() }
        };
        const mockRes = { status: () => ({ json: () => { } }) };
        try {
            await runWorkflow(mockReq, mockRes);
            await Schedule.findByIdAndUpdate(schedule._id, {
                lastRun: new Date(),
                nextRun: getNextRun(schedule.cronExpression)
            });
        } catch (err) {
            console.error('[CRON] Execution error:', err.message);
        }
    });
    activeTasks[idStr] = task;
};

exports.initScheduler = async () => {
    try {
        const schedules = await Schedule.find({ isActive: true });
        schedules.forEach(startCronJob);
        console.log(`[CRON] Scheduler started — ${schedules.length} active schedule(s) loaded.`);
    } catch (err) {
        console.error('[CRON] Failed to initialize scheduler:', err.message);
    }
};

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({ createdBy: req.user.id })
            .populate('workflow', 'name platform')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: schedules });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { workflowId, frequency, customCron } = req.body;
        const cronExp = frequency === 'custom' ? customCron : getCronExpression(frequency);
        if (!cronExp || !cron.validate(cronExp)) {
            return res.status(400).json({ error: 'Invalid cron expression' });
        }
        const schedule = await Schedule.create({
            workflow: workflowId,
            createdBy: req.user.id,
            frequency,
            cronExpression: cronExp,
            isActive: true,
            nextRun: getNextRun(cronExp)
        });
        startCronJob(schedule);
        const populated = await Schedule.findById(schedule._id).populate('workflow', 'name platform');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        console.error('Create schedule error:', err.message);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
};

exports.toggleSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ error: 'Not found' });
        if (schedule.createdBy.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

        schedule.isActive = !schedule.isActive;
        await schedule.save();

        const idStr = schedule._id.toString();
        if (schedule.isActive) {
            startCronJob(schedule);
        } else {
            if (activeTasks[idStr]) {
                activeTasks[idStr].stop();
                delete activeTasks[idStr];
            }
        }
        res.json({ success: true, data: schedule });
    } catch (err) {
        res.status(500).json({ error: 'Toggle failed' });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ error: 'Not found' });
        if (schedule.createdBy.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

        const idStr = schedule._id.toString();
        if (activeTasks[idStr]) {
            activeTasks[idStr].stop();
            delete activeTasks[idStr];
        }
        await schedule.deleteOne();
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};
