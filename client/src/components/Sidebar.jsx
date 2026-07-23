import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Workflow, Activity, Settings, ChevronLeft, ChevronRight, PlaySquare, CalendarDays, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();

    // This is React State! It remembers if our sidebar is folded or unfolded.
    const [isExpanded, setIsExpanded] = useState(true);

    const menuItems = [
        { name: 'Overview', path: '/', icon: Home },
        { name: 'Workflows', path: '/workflows', icon: Workflow },
        { name: 'Data Uploads', path: '/data', icon: Activity },
        { name: 'Executions', path: '/executions', icon: PlaySquare },
        { name: 'Schedules', path: '/schedules', icon: CalendarDays },
        { name: 'Reports', path: '/reports', icon: BarChart2 },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        /* motion.aside automatically animates the width changing smoothly between 256px and 80px! */
        <motion.aside
            animate={{ width: isExpanded ? 256 : 80 }}
            className="bg-slate-800 border-r border-slate-700 h-full flex flex-col hidden md:flex relative"
        >

            {/* The Folding Toggle Button floats right on the edge of the panel! */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-6 bg-indigo-600 rounded-full p-1 text-white hover:bg-indigo-500 shadow-lg z-50 flex items-center justify-center"
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Brand Logo Area */}
            <div className="p-6 border-b border-slate-700 h-20 flex items-center overflow-hidden">
                <Workflow size={24} className="text-indigo-400 min-w-max" />
                {/* We hide the word 'AutoDash' if folded! */}
                {isExpanded && (
                    <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-indigo-500 tracking-wide ml-2 whitespace-nowrap">
                        AutoDash
                    </motion.h2>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-3 overflow-hidden mt-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
                                }`}
                        >
                            <Icon size={20} className="min-w-max" />
                            {/* We hide the menu names if folded! */}
                            {isExpanded && (
                                <span className="font-medium tracking-wide ml-3 whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

        </motion.aside>
    );
};

export default Sidebar;