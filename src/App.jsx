import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // <--- THIS IS THE MISSING KEY

// --- COMPONENTS ---
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

// --- NEW PAGES (Glass Design) ---
import LandingPage from './pages/LandingPage';   // Replaces Login/AuthPage
import RegisterPage from './pages/RegisterPage'; // Dedicated Register Page

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'; 
import AdminQueue from './pages/AdminQueue';
import ManageOfficers from './pages/ManageOfficers';
import AllStudents from './pages/AllStudents';

// Officer Pages
import OfficerDashboard from './pages/OfficerDashboard';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* =========================================
            PUBLIC ROUTES
           ========================================= */}
        
        {/* Root path goes to Landing Page (which contains Login) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* /login explicitly goes to Landing Page */}
        <Route path="/login" element={<LandingPage />} />
        
        {/* /register goes to the dedicated Registration Page */}
        <Route path="/register" element={<RegisterPage />} />
        

        {/* =========================================
            ADMIN ROUTES (Super Admin Only)
           ========================================= */}
        <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['super_admin']}>
                <AdminLayout> <AdminDashboard /> </AdminLayout>
            </PrivateRoute>
        } />

        <Route path="/admin/officers" element={
              <PrivateRoute roles={['super_admin']}>
                  <AdminLayout> <ManageOfficers /> </AdminLayout>
              </PrivateRoute>
        } />
        
        <Route path="/admin/students" element={
              <PrivateRoute roles={['super_admin']}>
                  <AdminLayout> <AllStudents /> </AdminLayout>
              </PrivateRoute>
        } />

        <Route path="/admin/queue/:department" element={
            <PrivateRoute roles={['super_admin']}>
                <AdminLayout> <AdminQueue /> </AdminLayout>
            </PrivateRoute>
        } />


        {/* =========================================
            OFFICER ROUTES (Staff Only)
           ========================================= */}
        <Route path="/officer/dashboard" element={
            <PrivateRoute roles={['officer']}>
                <OfficerDashboard />
            </PrivateRoute>
        } />


        {/* =========================================
            STUDENT ROUTES (Students Only)
           ========================================= */}
        <Route path="/student/dashboard" element={
            <PrivateRoute roles={['student']}>
                <StudentDashboard />
            </PrivateRoute>
        } />

        {/* Fallback - Redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;