import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaUsers, FaHourglassHalf, FaCheckCircle, FaUserTie, FaSync, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';

function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/dashboard');
            setData(response.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    if (loading) return (
        <div className="page-container page-enter">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" />)}
            </div>
            <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
        </div>
    );

    const { stats, bottlenecks } = data;

    const statCards = [
        { title: 'Total Students', count: stats.total_students, icon: <FaUsers />, color: 'var(--accent)', bg: 'var(--accent-soft)', link: '/admin/students', linkText: 'View List' },
        { title: 'Active Clearances', count: stats.active_clearances, icon: <FaHourglassHalf />, color: 'var(--warning)', bg: 'var(--warning-soft)' },
        { title: 'Cleared Students', count: stats.cleared_students, icon: <FaCheckCircle />, color: 'var(--success)', bg: 'var(--success-soft)' },
        { title: 'Staff / Officers', count: stats.staff_count, icon: <FaUserTie />, color: 'var(--highlight)', bg: 'var(--highlight-soft)', link: '/admin/officers', linkText: 'Manage' },
    ];

    return (
        <div className="page-container page-enter">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                        System Overview
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        Welcome back, Admin. Here's what's happening today.
                    </p>
                </div>
                <button onClick={fetchDashboard} className="btn-ghost-glass">
                    <FaSync size={12} /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {statCards.map((s, i) => (
                    <div key={i} className="glass-card hover-lift">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                    {s.title}
                                </p>
                                <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                    {s.count}
                                </h3>
                            </div>
                            <div style={{
                                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                background: s.bg, color: s.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--text-lg)',
                            }}>
                                {s.icon}
                            </div>
                        </div>
                        {s.link && (
                            <Link to={s.link} style={{
                                fontSize: 'var(--text-xs)', fontWeight: 600, color: s.color,
                                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                                {s.linkText} <FaArrowRight size={10} />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottlenecks Table */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaExclamationTriangle size={16} style={{ color: 'var(--warning)' }} /> Department Traffic
                </h4>
            </div>

            <div className="glass-table-wrap">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 'var(--space-6)' }}>Department</th>
                            <th>Students Waiting</th>
                            <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bottlenecks.map(dept => (
                            <tr key={dept.id}>
                                <td style={{ paddingLeft: 'var(--space-6)', fontWeight: 600 }}>
                                    {dept.name}
                                </td>
                                <td>
                                    {dept.count > 0 ? (
                                        <span className="badge-glass badge-warning">{dept.count} Waiting</span>
                                    ) : (
                                        <span className="badge-glass badge-success">All Clear</span>
                                    )}
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                    {dept.count > 0 ? (
                                        <Link to={`/admin/queue/${encodeURIComponent(dept.name)}`}
                                            className="btn-primary-glass"
                                            style={{ padding: '6px 16px', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
                                            View Queue <FaArrowRight size={10} />
                                        </Link>
                                    ) : (
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Empty</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;