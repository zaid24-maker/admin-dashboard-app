import { useState, useEffect } from 'react';
import { Target, Activity, CheckCircle, Clock, Zap, Edit2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Operations = () => {
    const [roster, setRoster] = useState([]);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myRole, setMyRole] = useState(null);
    useEffect(() => {
        fetchOperations();
        fetchMyRole();
    }, []);

    const fetchMyRole = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            const d = await res.json();
            if (d.success) setMyRole(d.data.role);
        } catch { }
    }

    const fetchOperations = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/executions/operations`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const json = await res.json();
            if (json.success) {
                setRoster(json.roster);
                setFeed(json.feed);
            } else {
                toast.error("Failed to fetch operations layout.");
            }
        } catch {
            toast.error("Network communication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditTarget = async (id, currentTarget) => {
        const newTarget = prompt("Structural Recalibration: Enter numerical work target", currentTarget || 50);
        if (!newTarget || isNaN(newTarget)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${id}/target`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ target: Number(newTarget) })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Target algorithm mathematically updated!");
                fetchOperations();
            } else {
                toast.error(data.error || "Permission heavily denied.");
            }
        } catch { toast.error("Transmission to central core failed."); }
    }

    if (loading) return <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-transparent text-indigo-400 font-bold tracking-widest text-xs uppercase"><Loader2 className="animate-spin mb-3" size={32} /> LOADING...</div>;

    const totalTarget = roster?.reduce((acc, curr) => acc + (curr.workTarget || 0), 0) || 0;
    const totalCompleted = roster?.reduce((acc, curr) => acc + (curr.completed || 0), 0) || 0;

    return (
        <div className="space-y-6 pb-12">

            {/* Header */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-border flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight flex items-center space-x-3">
                        <Target className="text-indigo-500" size={32} />
                        <span>Team Operations</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Monitor live global team execution velocities and track workflow targets.</p>
                </div>
                <div className="flex space-x-4 h-full">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 w-36 shadow-inner text-center">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Global Target</p>
                        <p className="text-2xl font-black text-indigo-400">{totalTarget}</p>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/20 w-36 shadow-inner text-center">
                        <p className="text-xs text-emerald-500/70 uppercase font-bold tracking-widest mb-1">Total Executed</p>
                        <p className="text-2xl font-black text-emerald-400">{totalCompleted}</p>
                    </div>
                </div>
            </div>

            {/* Roster & Targets Grid */}
            <h2 className="text-xl font-bold text-slate-200 mt-8 mb-4 px-2">Operator Targets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {roster?.map((user, idx) => {
                        const progress = Math.min(((user?.completed || 0) / (user?.workTarget || 50)) * 100, 100) || 0;
                        const isDone = progress >= 100;
                        return (
                            <motion.div key={user._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className={`bg-background/80 backdrop-blur-md border ${isDone ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-border'} rounded-2xl p-5 shadow-lg relative overflow-hidden group`}>

                                {/* Background Sync Pulse indicator */}
                                {isDone && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />}

                                <div className="flex space-x-4 items-center">
                                    {user.avatar ? (
                                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${user.avatar}`} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 shadow-md" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex justify-center items-center font-black text-white text-xl shadow-md border-2 border-slate-700">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-white font-bold">{user.name}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-[10px] uppercase font-black tracking-widest bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{user.role}</span>
                                            {isDone && <CheckCircle size={14} className="text-emerald-400" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Velocity</span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-sm font-black ${isDone ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                                {user.completed} <span className="text-slate-500 text-xs">/ {user.workTarget || 50}</span>
                                            </span>
                                            {(myRole === 'Admin' || myRole === 'Owner') && (
                                                <button onClick={() => handleEditTarget(user._id, user.workTarget || 50)} className="text-slate-600 hover:text-indigo-400 bg-slate-900 border border-slate-700 hover:border-indigo-500 p-1 rounded transition-all shadow-md">
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${isDone ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Global Feed */}
            <h2 className="text-xl font-bold text-slate-200 mt-10 mb-4 px-2">Global Live Feed</h2>
            <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                    {feed?.map((action, i) => (
                        <div key={action?._id || i} className={`p-4 flex items-center justify-between transition-colors hover:bg-slate-700/30 ${i !== (feed?.length || 1) - 1 ? 'border-b border-slate-700/50' : ''}`}>
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex justify-center items-center shadow-inner">
                                    {action.status === 'success' ? <Zap size={18} className="text-yellow-400" /> : <Activity size={18} className="text-rose-400" />}
                                </div>
                                <div>
                                    <p className="text-slate-200 font-semibold text-sm">
                                        <span className="text-indigo-400">{action.triggeredBy?.name || 'Unknown Agent'}</span> executed <span className="text-white">'{action.workflow?.name || 'Deleted Node'}'</span>
                                    </p>
                                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                                        <span className="flex items-center space-x-1"><Clock size={12} /> <span>{new Date(action.startTime).toLocaleString()}</span></span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${action.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                            {action.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-600 font-mono hidden md:block">ID: {action?._id?.slice(-6) || 'Unknown'}</span>
                        </div>
                    ))}
                    {(!feed || feed.length === 0) && (
                        <div className="p-8 text-center text-slate-500 text-sm font-bold">No global operations executed recently.</div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Operations;
