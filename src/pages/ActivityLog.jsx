import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import { FaSearch, FaFilter, FaSyncAlt, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';

export default function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState([]);
    const [filters, setFilters] = useState({ search: '', action: '', role: '', from: '', to: '' });
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const fetchLogs = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = { ...filters, page: p };
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const res = await api.get('/admin/activity-logs', { params });
            setLogs(res.data.data || []);
            setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total });
        } catch (e) { toast.error('Failed to load activity logs'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    useEffect(() => {
        api.get('/admin/activity-logs/actions').then(r => setActions(r.data || [])).catch(() => { });
    }, []);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLogs(1); };

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) { }
        localStorage.clear(); navigate('/');
    };

    const actionColor = (action) => {
        if (action.includes('approved')) return '#10b981';
        if (action.includes('rejected') || action.includes('blocked') || action.includes('deleted')) return '#ef4444';
        if (action.includes('updated') || action.includes('login')) return '#3b5ceb';
        return '#f59e0b';
    };

    const actionIcon = (action) => {
        if (action.includes('approved')) return '✅';
        if (action.includes('rejected')) return '❌';
        if (action.includes('blocked')) return '🚫';
        if (action.includes('deleted')) return '🗑️';
        if (action.includes('bulk')) return '📋';
        if (action.includes('login')) return '🔑';
        if (action.includes('certificate')) return '📜';
        if (action.includes('template')) return '✉️';
        return '📝';
    };

    return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaShieldAlt /></div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Activity Log</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <ThemeToggle />
                    <NotificationBell />
                    <button onClick={() => navigate('/admin/dashboard')} className="btn-ghost-glass">← Dashboard</button>
                    <button onClick={handleLogout} className="btn-ghost-glass"><FaSignOutAlt size={12} /></button>
                </div>
            </nav>

            <div className="page-container page-enter">
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Activity Log</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        {meta.total ?? '...'} total events — searchable and filterable
                    </p>
                </div>

                {/* Filters */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-5)', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 220px', minWidth: 180 }}>
                        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Search</label>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={12} />
                            <input className="glass-input" style={{ paddingLeft: 30 }} placeholder="User name, email, action..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ flex: '1 1 160px', minWidth: 140 }}>
                        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Action</label>
                        <select className="glass-select" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}>
                            <option value="">All Actions</option>
                            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 120px', minWidth: 100 }}>
                        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Role</label>
                        <select className="glass-select" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="officer">Officer</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                    <div style={{ flex: '1 1 130px', minWidth: 110 }}>
                        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>From</label>
                        <input className="glass-input" type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
                    </div>
                    <div style={{ flex: '1 1 130px', minWidth: 110 }}>
                        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>To</label>
                        <input className="glass-input" type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-primary-glass" style={{ padding: 'var(--space-2) var(--space-4)', whiteSpace: 'nowrap' }}>
                        <FaFilter size={11} /> Filter
                    </button>
                    <button type="button" onClick={() => { setFilters({ search: '', action: '', role: '', from: '', to: '' }); setPage(1); setTimeout(() => fetchLogs(1), 50); }} className="btn-ghost-glass">
                        <FaSyncAlt size={11} /> Reset
                    </button>
                </form>

                {/* Logs Table */}
                <div className="glass-table-wrap">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-6)' }}>Action</th>
                                <th>User</th>
                                <th>Target</th>
                                <th>Details</th>
                                <th>IP</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>No logs found</td></tr>
                            ) : logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ paddingLeft: 'var(--space-6)' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}>
                                            <span>{actionIcon(log.action)}</span>
                                            <span style={{ color: actionColor(log.action), fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-sm)' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.user?.name ?? 'System'}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{log.user?.role}</div>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                        {log.target_type ? `${log.target_type} #${log.target_id}` : '—'}
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: 200 }}>
                                        {log.details ? Object.entries(log.details).map(([k, v]) => (
                                            <span key={k} style={{ display: 'inline-block', marginRight: 6 }}>
                                                <b>{k}:</b> {String(v).substring(0, 40)}
                                            </span>
                                        )) : '—'}
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ip_address ?? '—'}</td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                        {new Date(log.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} className={p === page ? 'btn-primary-glass' : 'btn-ghost-glass'}
                                style={{ padding: '4px 12px', fontSize: 'var(--text-sm)' }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
