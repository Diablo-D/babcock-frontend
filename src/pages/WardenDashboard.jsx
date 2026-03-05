import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { BABCOCK_SCHOOLS, SCHOOL_TO_DEPARTMENTS } from '../data/babcockDepartments';
import {
    FaSignOutAlt, FaCaretDown, FaUserShield, FaSync, FaFilter, FaTimes, FaCheck
} from 'react-icons/fa';

const STATUS_COLORS = {
    'Completed': 'badge-success',
    'In_Progress': 'badge-highlight',
    'Not Started': 'badge-warning',
};

function WardenDashboard() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [students, setStudents] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [warden, setWarden] = useState(null);

    // ── Filters ──────────────────────────────────────────────────────────────
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Available departments based on selected schools
    const availableDepts = selectedSchools.length === 1
        ? (SCHOOL_TO_DEPARTMENTS[selectedSchools[0]] ?? [])
        : [];

    const fetchStudents = useCallback(async (opts = {}) => {
        const { p = page, refresh = false } = opts;
        if (refresh) setRefreshing(true);
        try {
            const params = new URLSearchParams();
            selectedSchools.forEach(s => params.append('schools[]', s));
            if (selectedDept) params.append('department', selectedDept);
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', p);
            params.append('per_page', 20);

            const res = await api.get(`/warden/students?${params.toString()}`);
            setStudents(res.data.data ?? res.data);
            setMeta(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                toast.error('Access denied');
                navigate('/');
            }
        } finally { setLoading(false); setRefreshing(false); }
    }, [page, selectedSchools, selectedDept, searchTerm, navigate]);

    // Load user info from localStorage
    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setWarden(u);
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    // Close dropdown on outside click
    useEffect(() => {
        const h = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const toggleSchool = (school) => {
        setSelectedSchools(prev =>
            prev.includes(school) ? prev.filter(s => s !== school) : [...prev, school]
        );
        setSelectedDept(''); // reset dept when schools change
        setPage(1);
    };

    const clearFilters = () => {
        setSelectedSchools([]);
        setSelectedDept('');
        setSearchTerm('');
        setPage(1);
    };

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) { }
        localStorage.clear();
        toast.success('Logged out');
        navigate('/');
    };

    if (loading) return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: 220, height: 20 }} />
        </div>
    );

    const filtersActive = selectedSchools.length > 0 || selectedDept || searchTerm;

    return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: '1px solid var(--border-subtle)', background: 'transparent',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaUserShield size={15} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            Warden — Traffic Monitor
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {selectedSchools.length === 0
                                ? 'All Schools'
                                : selectedSchools.length === 1
                                    ? selectedSchools[0]
                                    : `${selectedSchools.length} schools selected`}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <ThemeToggle />
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowDropdown(!showDropdown)} className="btn-ghost-glass" style={{ padding: '6px 14px' }}>
                            <FaUserShield size={13} /> {warden?.name || 'Warden'} <FaCaretDown size={10} />
                        </button>
                        {showDropdown && (
                            <div style={{
                                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                                background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)',
                                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--glass-shadow-lg)', minWidth: 180, overflow: 'hidden',
                            }}>
                                <button onClick={handleLogout} style={{
                                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                                    padding: 'var(--space-3) var(--space-4)', background: 'transparent',
                                    border: 'none', color: 'var(--danger)', fontWeight: 600,
                                    fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                }}>
                                    <FaSignOutAlt /> Secure Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Page body ──────────────────────────────────────────────── */}
            <div className="page-container page-enter">

                {/* Header row */}
                <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                            Student Traffic
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            {meta.total ?? students.length} student{(meta.total ?? students.length) !== 1 ? 's' : ''}
                            {filtersActive && ' matching current filters'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        {filtersActive && (
                            <button onClick={clearFilters} className="btn-ghost-glass" style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>
                                <FaTimes size={11} /> Clear Filters
                            </button>
                        )}
                        <button onClick={() => fetchStudents({ refresh: true })} disabled={refreshing} className="btn-ghost-glass">
                            <FaSync size={12} style={refreshing ? { animation: 'spin 0.8s linear infinite' } : {}} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* ── School filter pills ─────────────────────────────────── */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                        <FaFilter size={10} style={{ marginRight: 4 }} />
                        Filter by School
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {BABCOCK_SCHOOLS.map(school => {
                            const active = selectedSchools.includes(school);
                            return (
                                <button
                                    key={school}
                                    onClick={() => toggleSchool(school)}
                                    style={{
                                        padding: '5px 12px', borderRadius: 'var(--radius-full)',
                                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border-default)'}`,
                                        background: active ? 'var(--accent-soft)' : 'transparent',
                                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                                        fontSize: 'var(--text-xs)', fontWeight: active ? 700 : 400,
                                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                        transition: 'all 0.15s ease',
                                        display: 'flex', alignItems: 'center', gap: 5,
                                    }}
                                >
                                    {active && <FaCheck size={9} />}
                                    {school}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Search + Dept filter row ────────────────────────────── */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by name or matric..."
                        className="glass-input"
                        style={{ flex: '1 1 260px' }}
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                    {availableDepts.length > 0 && (
                        <select
                            className="glass-select"
                            style={{ flex: '0 1 240px' }}
                            value={selectedDept}
                            onChange={e => { setSelectedDept(e.target.value); setPage(1); }}
                        >
                            <option value="">All Departments</option>
                            {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                </div>

                {/* ── Student table ───────────────────────────────────────── */}
                <div className="glass-table-wrap" style={{ width: '100%', overflowX: 'auto' }}>
                    <table className="glass-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-6)' }}>Student</th>
                                <th>Matric No</th>
                                <th>School</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th style={{ paddingRight: 'var(--space-6)' }}>Current Stage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                                        {filtersActive ? 'No students match your filters.' : 'No students found.'}
                                    </td>
                                </tr>
                            ) : students.map(s => (
                                <tr key={s.id}>
                                    <td style={{ paddingLeft: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: 'var(--radius-md)',
                                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: 'var(--text-xs)',
                                            }}>
                                                {(s.name || '??').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.matric_no}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 180 }}>{s.school}</td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.academic_dept}</td>
                                    <td>
                                        <span className={`badge-glass ${STATUS_COLORS[s.status] ?? 'badge-warning'}`} style={{ fontSize: '11px' }}>
                                            {s.status === 'In_Progress' ? 'In Progress' : s.status}
                                        </span>
                                    </td>
                                    <td style={{ paddingRight: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                        {s.current_location}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ──────────────────────────────────────────── */}
                {meta.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => { setPage(p); fetchStudents({ p }); }}
                                className={page === p ? 'btn-primary-glass' : 'btn-ghost-glass'}
                                style={{ padding: '6px 14px', fontSize: 'var(--text-sm)' }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WardenDashboard;
