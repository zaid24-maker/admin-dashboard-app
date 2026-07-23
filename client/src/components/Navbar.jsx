import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const [userName, setUserName] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users/me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) setUserName(data.data.name);
            } catch { }
        };
        fetchMe();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">

            {/* Search Bar */}
            <div className="flex items-center bg-slate-900 rounded-full px-4 py-2 border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all w-96 shadow-inner">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search workflows, logs, or users..."
                    className="bg-transparent border-none outline-none text-sm text-slate-100 ml-3 w-full placeholder-slate-500"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
                {/* Bell */}
                <motion.button
                    whileHover={{ scale: 1.15, rotate: 15 }}
                    whileTap={{ scale: 0.85 }}
                    className="p-2 text-slate-400 hover:text-indigo-400 transition-colors relative"
                >
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full" />
                </motion.button>

                {/* Avatar + Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full pl-1 pr-3 py-1 transition-all"
                    >
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {userName ? userName[0].toUpperCase() : <User size={14} />}
                        </div>
                        <span className="text-sm font-semibold text-slate-300 max-w-[100px] truncate">{userName || 'Account'}</span>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-slate-700">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-200 truncate">{userName}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:bg-rose-600 hover:text-white transition-all font-semibold text-sm"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Close dropdown if clicked outside */}
            {showMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            )}
        </header>
    );
};

export default Navbar;