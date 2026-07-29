import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Trash2, Edit, X, Settings, Loader2, CheckCircle2, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Workflows = () => {
    const [workflows, setWorkflows] = useState([]);
    const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
    const [currentWorkflow, setCurrentWorkflow] = useState(null);
    const [formData, setFormData] = useState({ name: '', platform: 'Custom', trigger: 'Manual', action: 'Log Data', webhookConfig: { url: '', method: 'POST', headers: '', payload: '' }, emailConfig: { to: '', subject: '', body: '' } });
    const [runningIds, setRunningIds] = useState({});
    const [userRole, setUserRole] = useState('Viewer');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                const json = await res.json();
                if (json.success) setUserRole(json.data.role);
            } catch (err) { }
        };
        fetchMe();
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setWorkflows(data.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = currentWorkflow
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows/${currentWorkflow._id}`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows`;

        try {
            await fetch(url, {
                method: currentWorkflow ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            setIsFlowModalOpen(false);
            setCurrentWorkflow(null);
            fetchWorkflows(); // Refresh data
        } catch (error) {
            console.error("Save Error:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this workflow?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchWorkflows();
        } catch (error) {
            console.error("Delete Error", error);
        }
    };

    const openCreateModal = () => {
        setCurrentWorkflow(null);
        setFormData({ name: '', platform: 'Custom', trigger: 'Manual', action: 'Log Data', webhookConfig: { url: '', method: 'POST', headers: '', payload: '' }, emailConfig: { to: '', subject: '', body: '' } });
        setIsFlowModalOpen(true);
    };

    const openEditModal = (flow) => {
        setCurrentWorkflow(flow);
        setFormData({ name: flow.name, platform: flow.platform || 'Custom', trigger: flow.trigger || 'Manual', action: flow.action || 'Log Data', webhookConfig: flow.webhookConfig || { url: '', method: 'POST', headers: '', payload: '' }, emailConfig: flow.emailConfig || { to: '', subject: '', body: '' } });
        setIsFlowModalOpen(true);
    };

    const handleRun = async (flow) => {
        setRunningIds(prev => ({ ...prev, [flow._id]: 'running' }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/executions/${flow._id}/run`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRunningIds(prev => ({ ...prev, [flow._id]: 'queued' }));
                setTimeout(() => {
                    setRunningIds(prev => { const n = { ...prev }; delete n[flow._id]; return n; });
                    navigate('/executions');
                }, 1500);
            } else {
                setRunningIds(prev => { const n = { ...prev }; delete n[flow._id]; return n; });
            }
        } catch (error) {
            console.error('Run Error:', error);
            setRunningIds(prev => { const n = { ...prev }; delete n[flow._id]; return n; });
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">Workflow Management</h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Create, configure, and seamlessly orchestrate all of your automation pipelines.</p>
                </div>
                {userRole !== 'Viewer' && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] active:scale-[0.98]"
                    >
                        <Plus size={20} />
                        <span>Create Pipeline</span>
                    </button>
                )}
            </div>

            {/* Workflow List Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden relative"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-300 text-sm border-b border-slate-700/80 uppercase tracking-widest">
                                <th className="p-5 font-bold">Workflow Pipeline</th>
                                <th className="p-5 font-bold">Integration</th>
                                <th className="p-5 font-bold">Live Status</th>
                                <th className="p-5 font-bold text-center">Manage Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {workflows.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center">
                                        <p className="text-slate-400 text-lg font-medium">No pipelines initialized yet.</p>
                                        <p className="text-slate-500 text-sm mt-2">Click 'Create Pipeline' above to deploy your first workflow.</p>
                                    </td>
                                </tr>
                            ) : workflows.map((flow) => (
                                <tr key={flow._id} className="hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-5">
                                        <p className="font-bold text-slate-100 text-lg">{flow.name}</p>
                                        <p className="text-xs text-indigo-400 font-semibold mt-1 flex items-center uppercase tracking-wider">
                                            <Settings size={12} className="mr-1" /> {flow.trigger} &rarr; {flow.action}
                                        </p>
                                    </td>
                                    <td className="p-5 text-slate-300 font-medium">
                                        <span className="px-4 py-1.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-bold shadow-inner">{flow.platform || 'Custom'}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${flow.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            {flow.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {userRole !== 'Viewer' ? (
                                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRun(flow)}
                                                    disabled={!!runningIds[flow._id]}
                                                    className={`p-3 rounded-xl font-bold transition-all shadow-lg border ${runningIds[flow._id] === 'queued'
                                                        ? 'bg-emerald-600 text-white border-transparent'
                                                        : runningIds[flow._id] === 'running'
                                                            ? 'bg-slate-800 text-blue-400 border-slate-700 cursor-not-allowed'
                                                            : 'bg-slate-900/80 hover:bg-emerald-600 text-emerald-400 hover:text-white border-slate-700/50 hover:border-transparent'
                                                        }`}
                                                    title="Run Workflow"
                                                >
                                                    {runningIds[flow._id] === 'running' ? <Loader2 size={18} className="animate-spin" /> :
                                                        runningIds[flow._id] === 'queued' ? <CheckCircle2 size={18} /> :
                                                            <Play size={18} />}
                                                </button>
                                                <button onClick={() => navigate(`/workflows/${flow._id}/canvas`)} title="Open Visual Canvas" className="p-3 bg-slate-900/80 hover:bg-fuchsia-600 rounded-xl text-fuchsia-400 hover:text-white transition-all shadow-lg border border-slate-700/50 hover:border-transparent"><Network size={18} /></button>
                                                <button onClick={() => openEditModal(flow)} className="p-3 bg-slate-900/80 hover:bg-indigo-600 rounded-xl text-indigo-400 hover:text-white transition-all shadow-lg border border-slate-700/50 hover:border-transparent"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(flow._id)} className="p-3 bg-slate-900/80 hover:bg-rose-600 rounded-xl text-rose-400 hover:text-white transition-all shadow-lg border border-slate-700/50 hover:border-transparent"><Trash2 size={18} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center text-xs font-bold text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                Read Only
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Futuristic Config Modal */}
            <AnimatePresence>
                {isFlowModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30, rotateX: 10 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_80px_-15px_rgba(99,102,241,0.4)] w-full max-w-lg overflow-hidden relative"
                        >
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>

                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    {currentWorkflow ? 'Inspect Pipeline' : 'Initialize Pipeline'}
                                </h2>
                                <button onClick={() => setIsFlowModalOpen(false)} className="text-slate-500 hover:text-rose-400 bg-slate-950/50 p-2 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Pipeline Designation</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold placeholder-slate-700" placeholder="E.g. Daily Analytics Sync" />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Integration App</label>
                                        <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-all">
                                            <option value="Shopify">🛒 Shopify</option>
                                            <option value="Salesforce">☁️ Salesforce</option>
                                            <option value="Slack">💬 Slack</option>
                                            <option value="Email">✉️ Email</option>
                                            <option value="Custom">⚡ Custom Node</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Trigger Event</label>
                                        <select value={formData.trigger} onChange={e => setFormData({ ...formData, trigger: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-all">
                                            <option value="Manual">👉 Manual Trigger</option>
                                            <option value="Scheduled">⏱️ Scheduled Task</option>
                                            <option value="Webhook">🔗 Webhook Push</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Execution Action</label>
                                    <select value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-all">
                                        <option value="Log Data">📝 Log Data to Console</option>
                                        <option value="Send Email">🚀 Send Mass Email Alert</option>
                                        <option value="Format Stats">📊 Generate Statistics</option>
                                        <option value="Send Webhook">🔗 Send Webhook Request</option>
                                    </select>
                                </div>

                                {formData.action === 'Send Webhook' && (
                                    <div className="space-y-4 p-5 bg-slate-950 border border-indigo-500/30 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 text-2xl opacity-10">🔗</div>
                                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Webhook Configuration</h3>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Endpoint URL</label>
                                                <input type="url" required value={formData.webhookConfig.url} onChange={e => setFormData({ ...formData, webhookConfig: { ...formData.webhookConfig, url: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-sm" placeholder="https://api.example.com/webhook" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Method</label>
                                                <select value={formData.webhookConfig.method} onChange={e => setFormData({ ...formData, webhookConfig: { ...formData.webhookConfig, method: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-sm font-semibold">
                                                    <option>POST</option><option>GET</option><option>PUT</option><option>DELETE</option><option>PATCH</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Headers (JSON format)</label>
                                                <textarea value={formData.webhookConfig.headers} onChange={e => setFormData({ ...formData, webhookConfig: { ...formData.webhookConfig, headers: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono h-24" placeholder='{"Authorization": "Bearer token"}'></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Payload (JSON format)</label>
                                                <textarea value={formData.webhookConfig.payload} onChange={e => setFormData({ ...formData, webhookConfig: { ...formData.webhookConfig, payload: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono h-24" placeholder='{"status": "success", "id": 123}'></textarea>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.action === 'Send Email' && (
                                    <div className="space-y-4 p-5 bg-slate-950 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 text-2xl opacity-10">✉️</div>
                                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Email Configuration</h3>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Recipient (To)</label>
                                            <input type="email" required value={formData.emailConfig.to} onChange={e => setFormData({ ...formData, emailConfig: { ...formData.emailConfig, to: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all text-sm" placeholder="user@company.com" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Subject</label>
                                            <input type="text" required value={formData.emailConfig.subject} onChange={e => setFormData({ ...formData, emailConfig: { ...formData.emailConfig, subject: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all text-sm" placeholder="Automation Alert" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Body (HTML Supported)</label>
                                            <textarea required value={formData.emailConfig.body} onChange={e => setFormData({ ...formData, emailConfig: { ...formData.emailConfig, body: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all text-xs h-24" placeholder="<h1>Alert Triggered!</h1>"></textarea>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 flex justify-end space-x-4 border-t border-white/5">
                                    <button type="button" onClick={() => setIsFlowModalOpen(false)} className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">Abort</button>
                                    <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] active:scale-[0.98]">
                                        {currentWorkflow ? 'Update Configuration' : 'Deploy Pipeline'}
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

export default Workflows;