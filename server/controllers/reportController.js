const Execution = require('../models/Execution');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const buildQuery = (userId, query) => {
    const filter = { triggeredBy: userId };
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.from || query.to) {
        filter.startTime = {};
        if (query.from) filter.startTime.$gte = new Date(query.from);
        if (query.to) filter.startTime.$lte = new Date(query.to);
    }
    return filter;
};

// GET /api/reports/summary — returns stats + trend data for charts
exports.getSummary = async (req, res) => {
    try {
        const filter = buildQuery(req.user.id, req.query);
        const executions = await Execution.find(filter)
            .populate('workflow', 'name')
            .sort({ startTime: -1 });

        const total = executions.length;
        const success = executions.filter(e => e.status === 'success').length;
        const failed = executions.filter(e => e.status === 'failed').length;
        const avgDuration = total
            ? Math.round(executions.filter(e => e.duration).reduce((a, b) => a + (b.duration || 0), 0) / total)
            : 0;

        // Build daily trend (last 7 days)
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            const label = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const dayStart = new Date(day.setHours(0, 0, 0, 0));
            const dayEnd = new Date(day.setHours(23, 59, 59, 999));
            const dayExecs = executions.filter(e => {
                const t = new Date(e.startTime);
                return t >= dayStart && t <= dayEnd;
            });
            trend.push({
                day: label,
                success: dayExecs.filter(e => e.status === 'success').length,
                failed: dayExecs.filter(e => e.status === 'failed').length,
                total: dayExecs.length,
            });
        }

        res.json({ success: true, data: { total, success, failed, avgDuration, trend, executions } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate summary' });
    }
};

// GET /api/reports/export/csv
exports.exportCSV = async (req, res) => {
    try {
        const filter = buildQuery(req.user.id, req.query);
        const executions = await Execution.find(filter).populate('workflow', 'name').sort({ startTime: -1 });

        const rows = executions.map(e => ({
            id: e._id.toString(),
            workflow: e.workflow?.name || 'Deleted',
            status: e.status,
            duration_ms: e.duration || 0,
            records_processed: e.result?.recordsProcessed || 0,
            message: e.result?.message || '',
            started_at: e.startTime ? new Date(e.startTime).toISOString() : '',
            ended_at: e.endTime ? new Date(e.endTime).toISOString() : '',
        }));

        const parser = new Parser({ fields: Object.keys(rows[0] || {}) });
        const csv = rows.length ? parser.parse(rows) : 'No data';

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="execution-report.csv"');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'CSV export failed' });
    }
};

// GET /api/reports/export/pdf
exports.exportPDF = async (req, res) => {
    try {
        const filter = buildQuery(req.user.id, req.query);
        const executions = await Execution.find(filter).populate('workflow', 'name').sort({ startTime: -1 });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="execution-report.pdf"');
        doc.pipe(res);

        // Header
        doc.fontSize(22).fillColor('#6366f1').text('Execution Report', { align: 'center' });
        doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1.5);

        // Summary stats
        const success = executions.filter(e => e.status === 'success').length;
        const failed = executions.filter(e => e.status === 'failed').length;
        doc.fontSize(12).fillColor('#1e293b');
        doc.text(`Total Executions: ${executions.length}   |   Success: ${success}   |   Failed: ${failed}`, { align: 'center' });
        doc.moveDown(1);

        // Table header
        const cols = { id: 40, workflow: 140, status: 230, duration: 310, started: 380 };
        doc.fontSize(9).fillColor('#ffffff');
        doc.rect(40, doc.y, 515, 18).fill('#6366f1');
        const headerY = doc.y - 14;
        doc.fillColor('#ffffff');
        doc.text('#', cols.id, headerY);
        doc.text('Workflow', cols.workflow, headerY);
        doc.text('Status', cols.status, headerY);
        doc.text('Duration', cols.duration, headerY);
        doc.text('Started At', cols.started, headerY);
        doc.moveDown(0.3);

        // Table rows
        executions.slice(0, 50).forEach((e, i) => {
            if (doc.y > 750) doc.addPage();
            const rowY = doc.y;
            const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
            doc.rect(40, rowY, 515, 16).fill(bg);
            const statusColor = e.status === 'success' ? '#10b981' : e.status === 'failed' ? '#ef4444' : '#3b82f6';
            doc.fillColor('#334155').fontSize(8);
            doc.text((i + 1).toString(), cols.id, rowY + 3);
            doc.text(e.workflow?.name || 'Deleted', cols.workflow, rowY + 3, { width: 80, ellipsis: true });
            doc.fillColor(statusColor).text(e.status.toUpperCase(), cols.status, rowY + 3);
            doc.fillColor('#334155');
            doc.text(e.duration ? `${(e.duration / 1000).toFixed(2)}s` : '—', cols.duration, rowY + 3);
            doc.text(e.startTime ? new Date(e.startTime).toLocaleString() : '—', cols.started, rowY + 3, { width: 150 });
            doc.moveDown(0.2);
        });

        doc.end();
    } catch (err) {
        console.error('PDF export error:', err);
        res.status(500).json({ error: 'PDF export failed' });
    }
};
