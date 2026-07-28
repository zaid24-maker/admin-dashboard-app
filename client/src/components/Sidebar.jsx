import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Workflow, Activity, Settings, ChevronLeft, ChevronRight, PlaySquare, CalendarDays, BarChart2, Target, Server, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(true);

    const menuItems = [
        { name: 'Overview', path: '/', icon: Home },
        { name: 'Workflows', path: '/workflows', icon: Workflow },
        { name: 'Data Uploads', path: '/data', icon: UploadCloud },
        { name: 'Executions', path: '/executions', icon: PlaySquare },
        { name: 'Schedules', path: '/schedules', icon: CalendarDays },
        { name: 'Reports', path: '/reports', icon: BarChart2 },
        { name: 'Team Operations', path: '/operations', icon: Target },
        { name: 'System Diagnostics', path: '/diagnostics', icon: Server },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <motion.aside
            animate={{ width: isExpanded ? 260 : 80 }}
            className="bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 h-full flex flex-col hidden md:flex relative"
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-6 bg-indigo-600 hover:bg-indigo-500 rounded-full p-1.5 text-white shadow-lg shadow-indigo-900/50 z-50 flex items-center justify-center transition-colors"
            >
                {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Brand */}
            <div className="p-6 border-b border-slate-700/50 h-20 flex items-center overflow-hidden">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <Workflow size={22} className="text-indigo-400" />
                </div>
                {isExpanded && (
                    <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-wide ml-3 whitespace-nowrap">
                        AutoDash
                    </motion.h2>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-hidden mt-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            title={!isExpanded ? item.name : undefined}
                            className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/40'
                                : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-100'
                                }`}
                        >
                            <Icon size={19} className={`min-w-max ${isActive ? 'text-white' : ''}`} />
                            {isExpanded && (
                                <span className="font-semibold tracking-wide ml-3 whitespace-nowrap text-sm">
                                    {item.name}
                                </span>
                            )}
                            {!isExpanded && (
                                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
