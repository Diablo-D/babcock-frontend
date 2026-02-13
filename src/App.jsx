import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- COMPONENTS ---
import AdminLayout from './components/AdminLayout';

// --- PAGES ---
import Login from './pages/Login';
import AdminOfficers from './pages/AdminOfficers';
import AdminDashboard from './pages/AdminDashboard'; // <--- The Real Import!

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes (Wrapped in Layout) */}
        <Route path="/admin/dashboard" element={
            <AdminLayout>
                <AdminDashboard /> 
            </AdminLayout>
        } />
        
        <Route path="/admin/officers" element={
            <AdminLayout>
                <AdminOfficers />
            </AdminLayout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;