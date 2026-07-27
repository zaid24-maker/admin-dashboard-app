const { parentPort } = require('worker_threads');
const os = require('os');

// Poll the OS hardware every 3 seconds completely isolated from the main Express Event Loop
setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

    // Abstracted calculation of basic CPU metric
    const loadAvg = os.loadavg()[0]; // 1-minute load average
    const cores = os.cpus().length;
    const cpuPercent = ((loadAvg / cores) * 100).toFixed(1);

    const metrics = {
        memory: {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2), // GB
            used: (usedMem / 1024 / 1024 / 1024).toFixed(2), // GB
            percentage: Number(memUsagePercent)
        },
        cpu: {
            cores: cores,
            loadAvg: loadAvg.toFixed(2),
            percentage: Number(cpuPercent) > 100 ? 100 : Number(cpuPercent)
        },
        osUptime: os.uptime(), // seconds
        processUptime: process.uptime() // seconds
    };

    parentPort.postMessage(metrics);
}, 3000);
