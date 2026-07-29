import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, AlertTriangle, Play, Pause, Trash2, Loader2, TrendingUp, BarChart3, Server, Cpu, HardDrive } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { io } from 'socket.io-client';

const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:border-slate-600 hover:shadow-2xl transition-all duration-300 cursor-default"
    >
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-slate-400 font-semibold text-sm mb-2 tracking-wide uppercase">{title}</p>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight">{value}</h3>
                <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
            </div>
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon size={22} className="text-white" />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverMetrics, setServerMetrics] = useState(null);

    useEffect(() => {
        const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5001'), { withCredentials: true });

        socket.on('server_metrics', (data) => {
            setServerMetrics(data);
        });

        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statRes, flowRes] = await Promise.all([
                    fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const statJson = await statRes.json();
                const flowJson = await flowRes.json();

                if (statJson.success) {
                    setStats({
                        successRate: statJson.data.successRate,
                        failedExecutions: statJson.data.failedExecutions.toLocaleString(),
                        activeSchedules: statJson.data.activeSchedules,
                        avgTime: statJson.data.avgTime
                    });
                    setChartData(statJson.data.chartData || []);
                }
                if (flowJson.success) setWorkflows(flowJson.data);
            } catch (error) {
                console.error("Server Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) return <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-transparent text-indigo-400 font-bold tracking-widest text-xs uppercase"><Loader2 className="animate-spin mb-3" size={32} /> LOADING...</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-600/20 transition-all duration-1000"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <BarChart3 size={20} className="text-indigo-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Command Center</span>
                    </div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-2">Workflow Overview</h1>
                    <p className="text-slate-400 text-sm font-medium max-w-xl">Real-time analytics, execution metrics, and pipeline management from a single view.</p>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard delay={0.1} title="Success Rate" value={stats?.successRate || '0%'} subtitle="From all executions" icon={CheckCircle} gradient="from-emerald-500 to-teal-500" />
                <StatCard delay={0.2} title="Failed Runs" value={stats?.failedExecutions || 0} subtitle="Needs attention" icon={AlertTriangle} gradient="from-rose-500 to-pink-500" />
                <StatCard delay={0.3} title="Avg Duration" value={stats?.avgTime || '0s'} subtitle="Per execution" icon={Clock} gradient="from-indigo-500 to-blue-500" />
                <StatCard delay={0.4} title="Active Schedules" value={stats?.activeSchedules || 0} subtitle="Automated pipelines" icon={Activity} gradient="from-purple-500 to-violet-500" />
            </div>

            {/* Middle Section: Chart + Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl shadow-xl relative overflow-hidden"
                >
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/5 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Execution Volume</h2>
                            <p className="text-xs text-slate-500 font-medium">Last 7 days performance trend</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center text-xs font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 shadow-lg shadow-indigo-500/50" /> Executions</span>
                            <span className="flex items-center text-xs font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-lg shadow-rose-500/50" /> Failed</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="execGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={12} />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '12px 16px' }} />
                            <Area type="monotone" dataKey="executions" stroke="#6366f1" strokeWidth={2.5} fill="url(#execGradient)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="failed" stroke="#f43f5e" strokeWidth={2.5} fill="url(#failGradient)" dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Telemetry Widget */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col group"
                >
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-all duration-700"></div>
                    <div className="flex items-center space-x-3 mb-8 relative z-10">
                        <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                            <Server size={20} className="text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Live Telemetry</h2>
                            <div className="flex items-center space-x-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Node Connected</p>
                            </div>
                        </div>
                    </div>

                    {serverMetrics ? (
                        <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                            {/* CPU */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-400 flex items-center tracking-wide"><Cpu size={14} className="mr-2 text-indigo-400" /> CPU Usage</span>
                                    <span className="text-white font-mono">{serverMetrics.cpu.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${serverMetrics.cpu.percentage}%` }}></div>
                                </div>
                            </div>
                            {/* Memory */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-400 flex items-center tracking-wide"><HardDrive size={14} className="mr-2 text-amber-400" /> RAM ({serverMetrics.memory.used} / {serverMetrics.memory.total} GB)</span>
                                    <span className="text-white font-mono">{serverMetrics.memory.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${serverMetrics.memory.percentage}%` }}></div>
                                </div>
                            </div>
                            {/* Uptime */}
                            <div className="pt-4 border-t border-slate-700/50 mt-auto">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">System Uptime</p>
                                <p className="text-sm text-slate-300 font-mono tracking-wider">{(serverMetrics.osUptime / 3600).toFixed(1)} Hours</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 opacity-50 relative z-10">
                            <Loader2 className="animate-spin mb-3" size={28} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Establishing Uplink...</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Workflows Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-800/80 to-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-white">Recent Workflows</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Quick access to your automation pipelines</p>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">{workflows.length} Pipelines</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/60 text-slate-400 text-[11px] border-b border-slate-700/50 uppercase tracking-widest">
                                <th className="p-4 pl-6 font-bold">Pipeline Name</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-center">Executions</th>
                                <th className="p-4 font-bold">Created</th>
                                <th className="p-4 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {workflows.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <TrendingUp size={48} className="mx-auto mb-4 opacity-10 text-slate-400" />
                                        <p className="text-slate-400 font-semibold">No workflows found</p>
                                        <p className="text-slate-500 text-sm mt-1">Create a pipeline to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                workflows.map((flow) => (
                                    <tr key={flow._id} className="hover:bg-slate-700/20 transition-colors group">
                                        <td className="p-4 pl-6 font-bold text-slate-200">{flow.name}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${flow.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                flow.status === 'Failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {flow.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-center font-mono text-sm">{flow.executionCount.toLocaleString()}</td>
                                        <td className="p-4 text-slate-500 text-sm">{new Date(flow.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-slate-700/50 hover:bg-emerald-600 rounded-lg text-emerald-400 hover:text-white transition-all border border-slate-600/50 hover:border-transparent"><Play size={14} /></button>
                                            <button className="p-2 bg-slate-700/50 hover:bg-amber-600 rounded-lg text-amber-400 hover:text-white transition-all border border-slate-600/50 hover:border-transparent"><Pause size={14} /></button>
                                            <button className="p-2 bg-slate-700/50 hover:bg-rose-600 rounded-lg text-rose-400 hover:text-white transition-all border border-slate-600/50 hover:border-transparent"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;