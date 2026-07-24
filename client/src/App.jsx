import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Workflows from './pages/Workflows';
import DataUpload from './pages/DataUpload';
import Executions from './pages/Executions';
import Schedules from './pages/Schedules';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', { withCredentials: true });

function App() {
  useEffect(() => {
    socket.on('execution_complete', (data) => {
      if (data.status === 'success') {
        toast.success(`Pipeline [${data.workflowName}] Completed: ${data.message}`, {
          duration: 6000,
          style: { background: '#0f172a', color: '#34d399', border: '1px solid #10b981' }
        });
      } else {
        toast.error(`Pipeline [${data.workflowName}] Failed: ${data.message}`, {
          duration: 6000,
          style: { background: '#0f172a', color: '#fb7185', border: '1px solid #e11d48' }
        });
      }
    });

    return () => socket.off('execution_complete');
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      <Routes>
        {/* 1. Public Routes (These do NOT have the Sidebar/Navbar layout frame) */}
        <Route path="/login" element={<Login />} />

        {/* 2. Protected App Routes (Wrapped securely inside the Dashboard Layout) */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Default to the Dashboard / Overview screen */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/data" element={<DataUpload />} />
          <Route path="/executions" element={<Executions />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 3. Fallback Route: If user types random bad URL, legally redirect them to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;