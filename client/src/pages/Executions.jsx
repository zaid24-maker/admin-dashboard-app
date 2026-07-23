import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, CheckCircle2, XCircle, PlaySquare, Trash2, Eye, X, AlertTriangle } from 'lucide-react';

const Executions = () => {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExec, setSelectedExec] = useState(null);

    useEffect(() => {
        fetchExecutions();
        const interval = setInterval(() => fetchExecutions(), 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchExecutions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/executions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setExecutions(data.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this execution log?")) return;
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5001/api/executions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchExecutions();
    };

    const handleClearAll = async () => {
        if (!window.confirm("Permanently clear ALL execution logs? This cannot be undone.")) return;
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5001/api/executions/clear-all', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchExecutions();
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'failed': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'running': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle2 size={14} />;
            case 'failed': return <XCircle size={14} />;
            case 'running': return <Activity size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Execution Logs</h1>
                    <p className="text-slate-400 text-sm">Monitor real-time workflow runs and audit history.</p>
                </div>
                {executions.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center space-x-2 bg-rose-900/30 hover:bg-rose-600 text-rose-400 hover:text-white font-bold py-3 px-5 rounded-xl transition-all border border-rose-800/50 hover:border-transparent"
                    >
                        <AlertTriangle size={16} />
                        <span>Clear All Logs</span>
                    </button>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-x-auto"
            >
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 text-slate-300 text-xs border-b border-slate-700/80 uppercase tracking-widest">
                            <th className="p-5 font-bold">Log ID</th>
                            <th className="p-5 font-bold">Workflow</th>
                            <th className="p-5 font-bold text-center">Status</th>
                            <th className="p-5 font-bold text-center">Duration</th>
                            <th className="p-5 font-bold">Result</th>
                            <th className="p-5 font-bold text-right">Timestamp</th>
                            <th className="p-5 font-bold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr><td colSpan="7" className="p-12 text-center text-slate-400">Loading...</td></tr>
                        ) : executions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-12 text-center">
                                    <PlaySquare size={48} className="mx-auto mb-4 opacity-20 text-slate-500" />
                                    <p className="text-slate-400 font-medium">No execution logs yet.</p>
                                    <p className="text-slate-500 text-sm mt-1">Trigger a workflow from the Workflows page.</p>
                                </td>
                            </tr>
                        ) : executions.map((exec) => (
                            <tr key={exec._id} className="hover:bg-slate-700/30 transition-colors group cursor-pointer" onClick={() => setSelectedExec(exec)}>
                                <td className="p-5 font-mono text-xs text-slate-500">#{exec._id.slice(-8)}</td>
                                <td className="p-5 font-bold text-slate-200">{exec.workflow?.name || <span className="italic text-slate-500">Deleted</span>}</td>
                                <td className="p-5 text-center">
                                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusStyles(exec.status)}`}>
                                        {getStatusIcon(exec.status)}
                                        <span>{exec.status}</span>
                                    </span>
                                </td>
                                <td className="p-5 text-center text-slate-300 font-mono text-sm">
                                    {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : '—'}
                                </td>
                                <td className="p-5 text-sm text-slate-400 max-w-[200px] truncate">
                                    {exec.result?.message || <span className="italic text-blue-400">Processing...</span>}
                                </td>
                                <td className="p-5 text-right whitespace-nowrap text-slate-400 text-sm">
                                    {new Date(exec.startTime).toLocaleString()}
                                </td>
                                <td className="p-5 text-center">
                                    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedExec(exec); }} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all">
                                            <Eye size={15} />
                                        </button>
                                        <button onClick={(e) => handleDelete(exec._id, e)} className="p-2 bg-slate-700 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedExec && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setSelectedExec(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Execution Detail</h2>
                                <button onClick={() => setSelectedExec(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    ['Workflow', selectedExec.workflow?.name || 'Deleted'],
                                    ['Status', selectedExec.status.toUpperCase()],
                                    ['Duration', selectedExec.duration ? `${(selectedExec.duration / 1000).toFixed(2)}s` : 'Running...'],
                                    ['Records Processed', selectedExec.result?.recordsProcessed ?? '—'],
                                    ['Start Time', new Date(selectedExec.startTime).toLocaleString()],
                                    ['End Time', selectedExec.endTime ? new Date(selectedExec.endTime).toLocaleString() : 'Running...'],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0">
                                        <span className="text-slate-500 text-sm font-medium">{label}</span>
                                        <span className="text-slate-200 font-bold text-sm">{value}</span>
                                    </div>
                                ))}
                                <div className="bg-slate-950 rounded-xl p-4 mt-2">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Engine Message</p>
                                    <p className="text-slate-300 text-sm">{selectedExec.result?.message || 'Processing in background...'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Executions;
