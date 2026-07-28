import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label
} from 'recharts';
import { Toaster, toast } from 'react-hot-toast';
import { FileDown, FileText, BarChart2, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

const TOKEN = () => localStorage.getItem('token');
const API = 'http://localhost:5001/api/reports';
const PIE_COLORS = ['#10b981', '#ef4444', '#3b82f6'];

const StatCard = ({ label, value, icon: Icon, bgColor, textColor, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center space-x-4"
    >
        <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon size={22} className={textColor} />
        </div>
        <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-extrabold text-white">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
    </motion.div>
);

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'all', from: '', to: '' });
    const [applied, setApplied] = useState({ status: 'all', from: '', to: '' });

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(
                Object.fromEntries(Object.entries(applied).filter(([, v]) => v && v !== 'all'))
            );
            const res = await fetch(`${API}/summary?${params}`, {
                headers: { Authorization: `Bearer ${TOKEN()}` }
            });
            const json = await res.json();
            if (json.success) setData(json.data);
            else toast.error('Failed to load report');
        } catch { toast.error('Network error'); }
        finally { setLoading(false); }
    }, [applied]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    const handleExport = async (type) => {
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(applied).filter(([, v]) => v && v !== 'all'))
        );
        const url = `${API}/export/${type}?${params}`;
        const toastId = toast.loading(`Generating ${type.toUpperCase()}...`);
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN()}` } });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `execution-report.${type}`;
            a.click();
            toast.success(`${type.toUpperCase()} downloaded!`, { id: toastId });
        } catch { toast.error('Export failed', { id: toastId }); }
    };

    const pieData = data ? [
        { name: 'Success', value: data.success },
        { name: 'Failed', value: data.failed },
        { name: 'Running', value: data.total - data.success - data.failed },
    ].filter(d => d.value > 0) : [];

    return (
        <div className="space-y-6 pb-12">


            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">Execution Reports</h1>
                    <p className="text-slate-400 text-sm">Analyze trends, filter by date, and export your data.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={() => handleExport('csv')}
                        className="flex items-center space-x-2 bg-emerald-700/30 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold py-3 px-5 rounded-xl transition-all border border-emerald-700/50 hover:border-transparent">
                        <FileDown size={18} /><span>Export CSV</span>
                    </button>
                    <button onClick={() => handleExport('pdf')}
                        className="flex items-center space-x-2 bg-rose-700/30 hover:bg-rose-600 text-rose-400 hover:text-white font-bold py-3 px-5 rounded-xl transition-all border border-rose-700/50 hover:border-transparent">
                        <FileText size={18} /><span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Status</label>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                        className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm font-semibold">
                        <option value="all">All</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="running">Running</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">From</label>
                    <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}
                        className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">To</label>
                    <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}
                        className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm" />
                </div>
                <button onClick={() => setApplied({ ...filters })}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all">
                    <Filter size={16} /><span>Apply</span>
                </button>
                <button onClick={() => { setFilters({ status: 'all', from: '', to: '' }); setApplied({ status: 'all', from: '', to: '' }); }}
                    className="text-slate-500 hover:text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm">
                    Reset
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : data && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Runs" value={data.total} icon={BarChart2} bgColor="bg-indigo-500/10" textColor="text-indigo-400" />
                        <StatCard label="Successful" value={data.success} icon={CheckCircle2} bgColor="bg-emerald-500/10" textColor="text-emerald-400"
                            sub={data.total ? `${Math.round(data.success / data.total * 100)}% success rate` : '—'} />
                        <StatCard label="Failed" value={data.failed} icon={XCircle} bgColor="bg-rose-500/10" textColor="text-rose-400" />
                        <StatCard label="Avg Duration" value={data.avgDuration ? `${(data.avgDuration / 1000).toFixed(1)}s` : '—'} icon={Clock} bgColor="bg-violet-500/10" textColor="text-violet-400" />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Chart — 7-day trend */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-slate-200 mb-5">7-Day Execution Trend</h2>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={data.trend}>
                                    <defs>
                                        <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }} />
                                    <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fill="url(#gSuccess)" name="Success" />
                                    <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#gFailed)" name="Failed" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Pie Chart — breakdown */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-slate-200 mb-5">Status Breakdown</h2>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90}
                                            paddingAngle={4} dataKey="value" stroke="none">
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                            <Label
                                                value={`${data.total ? Math.round((data.success / data.total) * 100) : 0}%`}
                                                position="center"
                                                fill="#ffffff"
                                                fontSize={28}
                                                fontWeight="bold"
                                            />
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
                            )}
                        </motion.div>
                    </div>

                    {/* Bar Chart — daily total */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-5">Daily Volume (Last 7 Days)</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data.trend} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }} />
                                <Bar dataKey="success" name="Success" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="failed" name="Failed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Reports;
