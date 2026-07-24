const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initScheduler } = require('./controllers/scheduleController');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect DB then boot the cron engine
connectDB().then(() => initScheduler());

// Routes
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
    cors: { origin: 'http://localhost:5173', credentials: true }
});
app.set('io', io); // Makes it globally accessible to controllers via req.app.get('io')

io.on('connection', (socket) => {
    console.log(`[Socket] Live Client Connected: ${socket.id}`);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server and WebSockets running on port ${PORT}`));
