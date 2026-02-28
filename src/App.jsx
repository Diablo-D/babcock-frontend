import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import ManageOfficers from './pages/ManageOfficers';
import AllStudents from './pages/AllStudents';
import AdminQueue from './pages/AdminQueue';
import OfficerDashboard from './pages/OfficerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ActivityLog from './pages/ActivityLog';
import EmailTemplates from './pages/EmailTemplates';
import VerifyCertificate from './pages/VerifyCertificate';

// Layout
import AdminLayout from './components/AdminLayout';

function App() {
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (window.innerWidth > 768) {
                document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
                document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <ThemeProvider>
            <ErrorBoundary>
                <Router>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />

                        {/* Admin */}
                        <Route path="/admin/dashboard" element={
                            <PrivateRoute allowedRoles={['super_admin']}>
                                <AdminLayout><AdminDashboard /></AdminLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/officers" element={
                            <PrivateRoute allowedRoles={['super_admin']}>
                                <AdminLayout><ManageOfficers /></AdminLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/students" element={
                            <PrivateRoute allowedRoles={['super_admin']}>
                                <AdminLayout><AllStudents /></AdminLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/queue/:deptName" element={
                            <PrivateRoute allowedRoles={['super_admin']}>
                                <AdminLayout><AdminQueue /></AdminLayout>
                            </PrivateRoute>
                        } />

                        {/* Officer */}
                        <Route path="/officer/dashboard" element={
                            <PrivateRoute allowedRoles={['officer']}>
                                <OfficerDashboard />
                            </PrivateRoute>
                        } />

                        {/* Student */}
                        <Route path="/student/dashboard" element={
                            <PrivateRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </PrivateRoute>
                        } />

                        {/* New Admin Pages */}
                        <Route path="/admin/activity-logs" element={
                            <PrivateRoute allowedRoles={['super_admin']}>
                                <ActivityLog />
                            </PrivateRoute>
                        } />
                        <Route path="/admin/email-templates" element={
                            <PrivateRoute allowedRoles={['super_admin']}>
                                <EmailTemplates />
                            </PrivateRoute>
                        } />

                        {/* Public — Certificate Verification (QR scan) */}
                        <Route path="/certificate/verify/:token" element={<VerifyCertificate />} />
                    </Routes>
                </Router>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '500',
                            background: 'var(--glass-bg-strong)',
                            backdropFilter: 'blur(20px)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--glass-shadow-lg)',
                            padding: '12px 16px',
                        },
                        success: {
                            iconTheme: { primary: 'var(--success)', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: 'var(--danger)', secondary: '#fff' },
                        },
                    }}
                />
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;