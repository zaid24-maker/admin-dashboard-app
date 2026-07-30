import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Cpu, HardDrive, Clock, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5001'), { withCredentials: true });

const Diagnostics = () => {
    const [metrics, setMetrics] = useState(null);
    const [connected, setConnected] = useState(socket.connected);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('server_metrics', (data) => {
            setMetrics(data);
            setHistory(prev => {
                const newHist = [...prev, { time: new Date().toLocaleTimeString(), cpu: data.cpu.percentage, ram: data.memory.percentage }];
                if (newHist.length > 20) newHist.shift(); // Keep last 20 ticks
                return newHist;
            });
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('server_metrics');
        };
    }, []);

    const formatTime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        return `${d}d ${h}h ${m}m`;
    };

    if (!metrics) return <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-transparent text-indigo-400 font-bold tracking-widest text-xs uppercase"><Loader2 className="animate-spin mb-3" size={32} /> LOADING...</div>;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">System Diagnostics</h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Live hardware telemetry routed via dedicated Worker Threads.</p>
                </div>
                <div className="flex items-center space-x-3 bg-background px-4 py-2 rounded-xl border border-border shadow-inner">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <div className={`absolute inset-0 w-3 h-3 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'} animate-ping opacity-75`}></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                        {connected ? 'Socket Live' : 'Link Offline'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-400"><Cpu size={100} /></div>
                    <div className="flex flex-col relative z-10">
                        <div className="flex items-center space-x-2 text-indigo-400 mb-4 font-bold text-sm tracking-widest uppercase">
                            <Cpu size={16} /> <span>CPU Thrash</span>
                        </div>
                        <span className="text-4xl font-black text-white">{metrics.cpu.percentage}%</span>
                        <div className="w-full bg-background h-2 mt-4 rounded-full overflow-hidden shadow-inner border border-border">
                            <motion.div animate={{ width: `${metrics.cpu.percentage}%` }} transition={{ type: 'spring' }} className="h-full bg-indigo-500 rounded-full" />
                        </div>
                        <p className="text-xs text-slate-500 mt-3 font-semibold">{metrics.cpu.cores} Cores • Load: {metrics.cpu.loadAvg}</p>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-400"><HardDrive size={100} /></div>
                    <div className="flex flex-col relative z-10">
                        <div className="flex items-center space-x-2 text-cyan-400 mb-4 font-bold text-sm tracking-widest uppercase">
                            <HardDrive size={16} /> <span>RAM Array</span>
                        </div>
                        <span className="text-4xl font-black text-white">{metrics.memory.percentage}%</span>
                        <div className="w-full bg-background h-2 mt-4 rounded-full overflow-hidden shadow-inner border border-border">
                            <motion.div animate={{ width: `${metrics.memory.percentage}%` }} transition={{ type: 'spring' }} className="h-full bg-cyan-500 rounded-full" />
                        </div>
                        <p className="text-xs text-slate-500 mt-3 font-semibold">{metrics.memory.used}GB Used / {metrics.memory.total}GB Total</p>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-400"><Clock size={100} /></div>
                    <div className="flex flex-col relative z-10 h-full">
                        <div className="flex items-center space-x-2 text-emerald-400 mb-4 font-bold text-sm tracking-widest uppercase">
                            <Zap size={16} /> <span>Process Matrix</span>
                        </div>
                        <span className="text-2xl font-black text-white mt-1">{formatTime(metrics.processUptime)}</span>
                        <p className="text-xs text-slate-500 mt-6 font-semibold">Uninterrupted V8 Core Time</p>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-400"><Server size={100} /></div>
                    <div className="flex flex-col relative z-10 h-full">
                        <div className="flex items-center space-x-2 text-purple-400 mb-4 font-bold text-sm tracking-widest uppercase">
                            <Server size={16} /> <span>Host Machine</span>
                        </div>
                        <span className="text-2xl font-black text-white mt-1">{formatTime(metrics.osUptime)}</span>
                        <p className="text-xs text-slate-500 mt-6 font-semibold">Total OS Hardware Uptime</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-background/80 backdrop-blur-md border-l-4 border-rose-500 p-5 rounded-xl shadow-lg">
                        <div className="flex items-start space-x-3 text-rose-400 font-bold tracking-widest text-xs uppercase mb-3">
                            <AlertTriangle size={16} /> <span>Telemetry Integrity</span>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Hardware metrics are mathematically extracted via Native Worker Threads to ensure absolute 0% latency impacts on the primary Express.js REST API loop.</p>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-8">
                    <div className="flex items-center justify-between mb-4 mt-2 px-1">
                        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Interactive Resource Allocation Graph (Live)</span>
                        <div className="flex space-x-4">
                            <span className="flex items-center text-xs font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-indigo-500 mr-2" /> CPU Thrash</span>
                            <span className="flex items-center text-xs font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-cyan-500 mr-2" /> RAM Array</span>
                        </div>
                    </div>
                    <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden p-6 h-56 flex items-end space-x-2 relative">
                        {history.map((h, idx) => (
                            <div key={idx} className="flex-1 bg-background rounded-t-lg relative overflow-hidden transition-all hover:bg-slate-800" style={{ height: '100%' }}>
                                <motion.div initial={{ height: 0 }} animate={{ height: `${h.cpu}%` }} transition={{ type: 'tween' }} className="absolute bottom-0 w-full bg-indigo-500/50 border-t-2 border-indigo-500" />
                                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min(h.ram, h.cpu - 5)}%` }} transition={{ type: 'tween' }} className="absolute bottom-0 w-full bg-cyan-500/50 border-t-2 border-cyan-400 mix-blend-screen" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diagnostics;
