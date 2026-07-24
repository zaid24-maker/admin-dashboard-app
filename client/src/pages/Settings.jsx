import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { User, Lock, Shield, Power, ChevronDown, Save, KeyRound, Users } from 'lucide-react';

const TOKEN = () => localStorage.getItem('token');
const API = 'http://localhost:5001/api/users';

const ROLES = ['Admin', 'Developer', 'Analyst', 'Tester', 'Viewer'];
const ROLE_COLORS = {
    Admin: 'rose', Developer: 'indigo', Analyst: 'violet',
    Tester: 'emerald', Viewer: 'slate'
};

const Badge = ({ role }) => {
    const c = ROLE_COLORS[role] || 'slate';
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-${c}-500/10 text-${c}-400 border border-${c}-500/20`}>
            {role}
        </span>
    );
};

const Settings = () => {
    const [tab, setTab] = useState('profile');
    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [users, setUsers] = useState([]);
    const [editingRole, setEditingRole] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Viewer');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchMe();
        fetchUsers();
    }, []);

    const fetchMe = async () => {
        const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${TOKEN()}` } });
        const json = await res.json();
        if (json.success) setProfile({ name: json.data.name, email: json.data.email, role: json.data.role, phone: json.data.phone || '' });
    };

    const fetchUsers = async () => {
        const res = await fetch(API, { headers: { Authorization: `Bearer ${TOKEN()}` } });
        const json = await res.json();
        if (json.success) setUsers(json.data);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API}/me`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone })
        });
        const json = await res.json();
        json.success ? toast.success('Profile updated!') : toast.error(json.error || 'Failed');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
        if (pwForm.newPassword.length < 6) return toast.error('Minimum 6 characters');
        const res = await fetch(`${API}/me/password`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
        });
        const json = await res.json();
        json.success ? (toast.success('Password changed!'), setPwForm({ currentPassword: '', newPassword: '', confirm: '' })) : toast.error(json.error || 'Failed');
    };

    const handleRoleChange = async (userId, role) => {
        const res = await fetch(`${API}/${userId}/role`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
        const json = await res.json();
        if (json.success) { toast.success(`Role updated to ${role}`); fetchUsers(); setEditingRole(null); }
        else toast.error('Failed to update role');
    };

    const handleToggleUser = async (userId) => {
        const res = await fetch(`${API}/${userId}/toggle`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${TOKEN()}` }
        });
        const json = await res.json();
        if (json.success) { toast.success(`User ${json.data.isActive ? 'activated' : 'deactivated'}`); fetchUsers(); }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/team/invite`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Invitation email dispatched securely!');
                setInviteEmail('');
                fetchUsers();
            } else {
                toast.error(json.error || 'Failed to dispatch invite');
            }
        } catch (error) {
            toast.error("Network connection failed.");
        }
        setIsInviting(false);
    };

    const TABS = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'users', label: 'User Management', icon: Users },
    ];

    const inputClass = "w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder-slate-700";

    return (
        <div className="space-y-6 pb-12">
            

            {/* Header */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h1 className="text-3xl font-extrabold text-white mb-1">Settings</h1>
                <p className="text-slate-400 text-sm">Manage your profile, security, and team members.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 h-fit space-y-1">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                            <Icon size={17} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {/* ── Profile Tab ── */}
                        {tab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                                <div className="flex items-center space-x-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                        {profile.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-xl font-extrabold text-white">{profile.name || '—'}</p>
                                        <p className="text-sm text-slate-400">{profile.email}</p>
                                        <Badge role={profile.role || 'Tester'} />
                                    </div>
                                </div>
                                <hr className="border-slate-700" />
                                <form onSubmit={handleSaveProfile} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Display Name</label>
                                        <input className={inputClass} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address</label>
                                        <input className={inputClass} type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="you@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Phone Number</label>
                                        <input className={inputClass} type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-7 rounded-xl transition-all">
                                            <Save size={16} /><span>Save Changes</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* ── Security Tab ── */}
                        {tab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl"><KeyRound size={22} className="text-indigo-400" /></div>
                                    <div>
                                        <p className="font-bold text-white">Change Password</p>
                                        <p className="text-slate-500 text-sm">Use a strong password of at least 6 characters.</p>
                                    </div>
                                </div>
                                <hr className="border-slate-700" />
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    {[
                                        { label: 'Current Password', key: 'currentPassword' },
                                        { label: 'New Password', key: 'newPassword' },
                                        { label: 'Confirm New Password', key: 'confirm' }
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{label}</label>
                                            <input className={inputClass} type="password" value={pwForm[key]}
                                                onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} placeholder="••••••••" />
                                        </div>
                                    ))}
                                    <div className="flex justify-end">
                                        <button type="submit" className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3 px-7 rounded-xl transition-all">
                                            <Shield size={16} /><span>Update Password</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* ── Users Tab ── */}
                        {tab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/40">
                                    <div>
                                        <p className="font-bold text-white text-lg">Team Members</p>
                                        <p className="text-slate-500 text-sm">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <form onSubmit={handleInvite} className="flex items-center space-x-3 bg-slate-800 border border-slate-700/50 p-2 rounded-xl shadow-lg">
                                        <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Invite via email..." className="bg-transparent text-white text-sm focus:outline-none px-3 w-48 tracking-wide placeholder-slate-500" />
                                        <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="bg-slate-900 text-xs font-bold text-slate-300 rounded-lg px-3 py-2 focus:outline-none border border-slate-700 transition-colors hover:border-indigo-500 cursor-pointer">
                                            {ROLES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                        <button type="submit" disabled={isInviting} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md disabled:opacity-50">
                                            {isInviting ? 'Sending...' : 'Invite'}
                                        </button>
                                    </form>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
                                            <th className="p-4">User</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Joined</th>
                                            <th className="p-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {users.map(u => (
                                            <tr key={u._id} className="group hover:bg-slate-700/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-black">
                                                            {u.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-100 font-semibold text-sm">{u.name}</p>
                                                            <p className="text-slate-500 text-xs">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="relative inline-block">
                                                        {editingRole === u._id ? (
                                                            <select autoFocus defaultValue={u.role}
                                                                onBlur={() => setEditingRole(null)}
                                                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                                                className="bg-slate-900 border border-indigo-500 text-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none">
                                                                {ROLES.map(r => <option key={r}>{r}</option>)}
                                                            </select>
                                                        ) : (
                                                            <button onClick={() => setEditingRole(u._id)}
                                                                className="flex items-center space-x-1 group/role">
                                                                <Badge role={u.role || 'Tester'} />
                                                                <ChevronDown size={12} className="text-slate-600 group-hover/role:text-slate-400 transition-colors" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-600/10 text-slate-500 border-slate-600/20'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500 text-sm">
                                                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center">
                                                        <button onClick={() => handleToggleUser(u._id)}
                                                            className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all border ${u.isActive ? 'bg-slate-700 hover:bg-rose-600 text-rose-400 hover:text-white border-slate-600' : 'bg-slate-700 hover:bg-emerald-600 text-emerald-400 hover:text-white border-slate-600'}`}
                                                            title={u.isActive ? 'Deactivate' : 'Activate'}>
                                                            <Power size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
