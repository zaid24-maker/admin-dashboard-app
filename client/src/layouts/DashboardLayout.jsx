import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    const token = localStorage.getItem('token');

    // No token = not logged in, send to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex w-full h-screen bg-slate-900 text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-5">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;