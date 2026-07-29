const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Worker } = require('worker_threads');
const { initScheduler } = require('./controllers/scheduleController');
const path = require('path');

dotenv.config();

const app = express();
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect DB then boot the cron engine
connectDB().then(() => initScheduler());

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/executions', require('./routes/executionRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
const workflowRoutes = require('./routes/workflowRoutes');
app.use('/api/workflows', workflowRoutes);

const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: clientOrigin, credentials: true }
});
app.set('io', io); // Makes it globally accessible to controllers via req.app.get('io')

io.on('connection', (socket) => {
    console.log(`[Socket] Live Client Connected: ${socket.id}`);
});

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
});

// Telemetry Worker Thread Initiation (Phase 19)
const telemetryWorker = new Worker(path.join(__dirname, 'utils/telemetryWorker.js'));
telemetryWorker.on('message', (metrics) => {
    io.emit('server_metrics', metrics);
});
telemetryWorker.on('error', (err) => {
    console.error('[CRITICAL] Telemetry worker fatality:', err);
});

// Port and Startup
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server and WebSockets running on port ${PORT}`));
