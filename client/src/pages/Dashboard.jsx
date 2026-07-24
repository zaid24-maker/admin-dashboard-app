import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Notice we imported some new icon buttons for the table!
import { Activity, CheckCircle, Clock, AlertTriangle, Play, Pause, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors cursor-default"
    >
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 font-medium mb-1 tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-20 text-white shadow-inner`}>
                <Icon size={24} />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        successRate: "0%", failedExecutions: 0, avgTime: "0s", activeSchedules: 0
    });
    const [chartData, setChartData] = useState([]);

    // NEW: We created a memory pocket for our Workflow List!
    const [workflows, setWorkflows] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');

                // 1. Fetch Stats
                const statRes = await fetch('http://localhost:5001/api/workflows/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statJson = await statRes.json();
                if (statJson.success) {
                    setStats({
                        successRate: statJson.data.successRate,
                        failedExecutions: statJson.data.failedExecutions.toLocaleString(),
                        activeSchedules: statJson.data.activeSchedules,
                        avgTime: statJson.data.avgTime
                    });
                    setChartData(statJson.data.chartData || []);
                }

                // 2. NEW: Fetch Workflow List Array!
                const flowRes = await fetch('http://localhost:5001/api/workflows', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const flowJson = await flowRes.json();
                if (flowJson.success) {
                    setWorkflows(flowJson.data); // Squirt the array into our State!
                }

            } catch (error) {
                console.error("Server Fetch Error:", error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-6 pb-12">
            <h1 className="text-2xl font-bold text-white mb-6">Workflow Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard delay={0.1} title="Success Rate" value={stats.successRate} subtitle="Live from MongoDB" icon={CheckCircle} color="bg-emerald-500" />
                <StatCard delay={0.2} title="Failed Executions" value={stats.failedExecutions} subtitle="Live from MongoDB" icon={AlertTriangle} color="bg-rose-500" />
                <StatCard delay={0.3} title="Avg Execution Time" value={stats.avgTime} subtitle="Consistent speed" icon={Clock} color="bg-indigo-500" />
                <StatCard delay={0.4} title="Active Schedules" value={stats.activeSchedules} subtitle="Live from MongoDB" icon={Activity} color="bg-purple-500" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg mt-8 h-96"
            >
                <h2 className="text-lg font-bold text-slate-200 mb-6">Execution Volume (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickMargin={10} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickMargin={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="executions" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="failed" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* NEW: Live Workflows Data Table! */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden mt-8"
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-200">Recent Workflows</h2>
                    <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All &rarr;</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                                <th className="p-4 font-semibold tracking-wide">Workflow Name</th>
                                <th className="p-4 font-semibold tracking-wide">Status</th>
                                <th className="p-4 font-semibold tracking-wide">Executions</th>
                                <th className="p-4 font-semibold tracking-wide">Created Date</th>
                                <th className="p-4 font-semibold tracking-wide text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {workflows.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 italic">No workflows found. Create one!</td>
                                </tr>
                            ) : (
                                workflows.map((flow) => (
                                    <tr key={flow._id} className="hover:bg-slate-700/20 transition-colors group">
                                        <td className="p-4 font-medium text-slate-200">{flow.name}</td>
                                        <td className="p-4">
                                            {/* Dynamic Status Badges! */}
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${flow.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                flow.status === 'Failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                {flow.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">{flow.executionCount.toLocaleString()}</td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(flow.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-emerald-400 transition-colors shadow-lg"><Play size={16} /></button>
                                            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-amber-400 transition-colors shadow-lg"><Pause size={16} /></button>
                                            <button className="p-2 bg-slate-700 hover:bg-rose-600 rounded-lg text-rose-400 hover:text-white transition-colors shadow-lg"><Trash2 size={16} /></button>
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