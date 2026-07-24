import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, X, Power, Trash2, Clock, CalendarDays, Zap } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: { 'en-US': enUS },
});

const FREQ_OPTIONS = [
    { value: 'daily', label: '⏱ Daily (9:00 AM)', color: 'indigo' },
    { value: 'weekly', label: '📅 Weekly (Mon 9:00 AM)', color: 'purple' },
    { value: 'monthly', label: '🗓 Monthly (1st, 9:00 AM)', color: 'violet' },
    { value: 'custom', label: '⚡ Custom Cron', color: 'rose' },
];

const getNextRunDate = (freq) => {
    const now = new Date();
    if (freq === 'daily') return addDays(now, 1);
    if (freq === 'weekly') return addWeeks(now, 1);
    if (freq === 'monthly') return addMonths(now, 1);
    return addDays(now, 1);
};

const Schedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [calendarView, setCalendarView] = useState(false);
    const [form, setForm] = useState({ workflowId: '', frequency: 'daily', customCron: '' });

    useEffect(() => {
        fetchSchedules();
        fetchWorkflows();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/schedules', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setSchedules(data.data);
        } catch { toast.error('Could not load schedules'); }
    };

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/workflows', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setWorkflows(data.data);
        } catch { }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/schedules', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Schedule deployed!');
                setIsModalOpen(false);
                setForm({ workflowId: '', frequency: 'daily', customCron: '' });
                fetchSchedules();
            } else {
                toast.error(data.error || 'Failed');
            }
        } catch { toast.error('Network error'); }
    };

    const handleToggle = async (id) => {
        try {
            const res = await fetch(`http://localhost:5001/api/schedules/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.data.isActive ? 'Schedule activated!' : 'Schedule paused');
                fetchSchedules();
            }
        } catch { toast.error('Toggle failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this schedule permanently?')) return;
        try {
            await fetch(`http://localhost:5001/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Schedule removed');
            fetchSchedules();
        } catch { toast.error('Delete failed'); }
    };

    // Build calendar events from schedule list
    const calendarEvents = schedules.map((s) => ({
        title: s.workflow?.name || 'Workflow',
        start: s.nextRun ? new Date(s.nextRun) : getNextRunDate(s.frequency),
        end: s.nextRun ? new Date(new Date(s.nextRun).getTime() + 30 * 60000) : getNextRunDate(s.frequency),
        resource: s,
    }));

    return (
        <div className="space-y-6 pb-12">
            

            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Automation Scheduler</h1>
                    <p className="text-slate-400 text-sm">Deploy recurring workflows on intelligent cron timers.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setCalendarView(!calendarView)}
                        className={`flex items-center space-x-2 py-3 px-5 rounded-xl font-bold border transition-all ${calendarView
                                ? 'bg-indigo-600 text-white border-transparent'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500'
                            }`}
                    >
                        <CalendarDays size={18} />
                        <span>Calendar</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                    >
                        <Plus size={20} />
                        <span>New Schedule</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Schedules', value: schedules.length, icon: Clock, color: 'indigo' },
                    { label: 'Active', value: schedules.filter(s => s.isActive).length, icon: Zap, color: 'emerald' },
                    { label: 'Paused', value: schedules.filter(s => !s.isActive).length, icon: Power, color: 'rose' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center space-x-4`}
                    >
                        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
                            <Icon size={22} className={`text-${color}-400`} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-extrabold text-white">{value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Calendar View */}
            <AnimatePresence>
                {calendarView && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-4"
                        style={{ '--rbc-today-bg': 'rgba(99,102,241,0.1)' }}
                    >
                        <style>{`
                            .rbc-calendar { background: transparent; color: #cbd5e1; font-family: inherit; }
                            .rbc-header { background: #0f172a; border-color: #334155; color: #94a3b8; padding: 8px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
                            .rbc-day-bg { background: transparent; }
                            .rbc-day-bg.rbc-today { background: rgba(99,102,241,0.08); }
                            .rbc-off-range-bg { background: rgba(0,0,0,0.2); }
                            .rbc-month-view, .rbc-time-view { border-color: #334155; }
                            .rbc-day-slot .rbc-time-slot { border-color: #1e293b; }
                            .rbc-time-header { background: #0f172a; }
                            .rbc-label { color: #64748b; font-size: 11px; }
                            .rbc-event { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 6px; font-size: 12px; font-weight: 700; padding: 2px 6px; }
                            .rbc-toolbar { margin-bottom: 16px; }
                            .rbc-toolbar button { background: #1e293b; color: #94a3b8; border-color: #334155; border-radius: 8px; font-weight: 600; padding: 6px 14px; transition: all 0.2s; }
                            .rbc-toolbar button:hover, .rbc-toolbar button.rbc-active { background: #6366f1; color: white; border-color: transparent; }
                            .rbc-date-cell { color: #64748b; font-size: 13px; }
                            .rbc-date-cell.rbc-now { color: #818cf8; font-weight: 800; }
                        `}</style>
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 480 }}
                            eventPropGetter={() => ({})}
                            onSelectEvent={(e) => toast(`📅 ${e.title} - ${format(e.start, 'PPpp')}`, { icon: '⚡' })}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden"
            >
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
                            <th className="p-5">Workflow</th>
                            <th className="p-5">Frequency</th>
                            <th className="p-5">Status</th>
                            <th className="p-5">Next Run</th>
                            <th className="p-5">Last Run</th>
                            <th className="p-5 text-center">Controls</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {schedules.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center">
                                    <CalendarDays size={48} className="mx-auto mb-4 opacity-20 text-slate-400" />
                                    <p className="text-slate-400 font-medium">No schedules yet.</p>
                                    <p className="text-slate-500 text-sm mt-1">Click "New Schedule" to automate a workflow.</p>
                                </td>
                            </tr>
                        ) : schedules.map((s) => (
                            <motion.tr
                                key={s._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group hover:bg-slate-700/20 transition-colors"
                            >
                                <td className="p-5">
                                    <p className="font-bold text-slate-100">{s.workflow?.name || 'Deleted Workflow'}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{s.cronExpression}</p>
                                </td>
                                <td className="p-5">
                                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase">
                                        {s.frequency}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${s.isActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-slate-600/10 text-slate-500 border-slate-600/20'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                        <span>{s.isActive ? 'Active' : 'Paused'}</span>
                                    </span>
                                </td>
                                <td className="p-5 text-slate-300 text-sm">
                                    {s.nextRun ? format(new Date(s.nextRun), 'MMM d, yyyy h:mm a') : '—'}
                                </td>
                                <td className="p-5 text-slate-500 text-sm">
                                    {s.lastRun ? format(new Date(s.lastRun), 'MMM d, h:mm a') : 'Never'}
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleToggle(s._id)}
                                            className={`p-2.5 rounded-xl transition-all border ${s.isActive
                                                    ? 'bg-slate-700 hover:bg-yellow-600 text-yellow-400 hover:text-white border-slate-600'
                                                    : 'bg-slate-700 hover:bg-emerald-600 text-emerald-400 hover:text-white border-slate-600'
                                                }`}
                                            title={s.isActive ? 'Pause' : 'Activate'}
                                        >
                                            <Power size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s._id)}
                                            className="p-2.5 bg-slate-700 hover:bg-rose-600 rounded-xl text-rose-400 hover:text-white transition-all border border-slate-600"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Create Schedule Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                                <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Deploy Schedule
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-rose-400 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Select Workflow</label>
                                    <select
                                        required
                                        value={form.workflowId}
                                        onChange={e => setForm({ ...form, workflowId: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                    >
                                        <option value="">— Choose a workflow —</option>
                                        {workflows.map(w => (
                                            <option key={w._id} value={w._id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Frequency</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {FREQ_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, frequency: opt.value })}
                                                className={`p-3 rounded-xl text-sm font-bold border transition-all text-left ${form.frequency === opt.value
                                                        ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {form.frequency === 'custom' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Cron Expression</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 0 8 * * 1-5"
                                            value={form.customCron}
                                            onChange={e => setForm({ ...form, customCron: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                        <p className="text-xs text-slate-600 mt-1.5">Format: min hour day month weekday</p>
                                    </motion.div>
                                )}
                                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-7 rounded-xl transition-all shadow-lg">
                                        Deploy ⚡
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedules;
