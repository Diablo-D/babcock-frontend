import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaUserTie, FaSignOutAlt } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';
import toast from 'react-hot-toast';

function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) { /* ignore */ }
        localStorage.clear();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const navLinks = [
        { path: '/admin/dashboard', icon: <FaTachometerAlt size={16} />, label: 'Dashboard' },
        { path: '/admin/officers', icon: <FaUserTie size={16} />, label: 'Manage Officers' },
        { path: '/admin/students', icon: <FaUsers size={16} />, label: 'All Students' },
    ];

    return (
        <div className="animated-mesh-bg" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* ── Glass Sidebar ── */}
            <aside className="glass-sidebar" style={{
                width: 260, display: 'flex', flexDirection: 'column',
                padding: 'var(--space-6) var(--space-4)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 'var(--text-base)',
                    }}>B</div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        BUCS Admin
                    </span>
                </div>

                {/* Theme Toggle */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <ThemeToggle />
                </div>

                <div className="glass-divider" />

                {/* Nav Links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1, marginTop: 'var(--space-4)' }}>
                    {navLinks.map(link => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link key={link.path} to={link.path} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-md)', textDecoration: 'none',
                                background: isActive ? 'var(--accent-soft)' : 'transparent',
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: 'var(--text-sm)',
                                transition: 'all 200ms ease',
                                border: isActive ? '1px solid rgba(59,92,235,0.1)' : '1px solid transparent',
                            }}>
                                {link.icon}
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="glass-divider" />

                {/* Logout */}
                <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                    background: 'var(--danger-soft)', color: 'var(--danger)',
                    border: '1px solid rgba(239,68,68,0.1)', cursor: 'pointer',
                    fontWeight: 600, fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-sans)', transition: 'all 200ms ease',
                }}>
                    <FaSignOutAlt size={14} /> Log Out
                </button>
            </aside>

            {/* ── Main Content ── */}
            <main style={{ flex: 1, overflow: 'auto', height: '100vh' }}>
                {children}
            </main>
        </div>
    );
}

export default AdminLayout;