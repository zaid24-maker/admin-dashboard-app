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

function App() {
  return (
    <BrowserRouter>
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