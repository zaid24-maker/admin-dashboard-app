import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { pageVariants } from '../utils/motion';

const DashboardLayout = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    // No token = not logged in, send to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex w-full h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-5">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                variants={pageVariants}
                                initial="initial"
                                animate="enter"
                                exit="exit"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
