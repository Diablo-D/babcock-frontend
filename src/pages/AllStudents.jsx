import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaSync, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function AllStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchStudents = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/students?page=${pageNum}`);
            const data = res.data;
            setStudents(data.data || data);
            setPage(data.current_page || 1);
            setLastPage(data.last_page || 1);
            setTotal(data.total || (data.data || data).length);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return (s.user?.name || '').toLowerCase().includes(q) ||
            (s.matric_no || '').toLowerCase().includes(q);
    });

    const statusBadge = (status) => {
        if (status === 'completed') return <span className="badge-glass badge-success">Completed</span>;
        if (status === 'in_progress') return <span className="badge-glass badge-warning">In Progress</span>;
        return <span className="badge-glass badge-muted">Pending</span>;
    };

    return (
        <div className="page-container page-enter">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                        <Link to="/admin/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex' }}>
                            <FaArrowLeft size={14} />
                        </Link>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Student Master List
                        </h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        {total} registered student{total !== 1 ? 's' : ''}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="glass-input" placeholder="Search name or matric..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 32, width: 240 }} />
                    </div>
                    <button onClick={() => fetchStudents(page)} className="btn-icon-glass">
                        <FaSync size={13} />
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
            ) : (
                <>
                    <div className="glass-table-wrap">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 'var(--space-6)' }}>Student</th>
                                    <th>Matric No</th>
                                    <th>Department</th>
                                    <th>Current Stage</th>
                                    <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ paddingLeft: 'var(--space-6)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                                    background: 'var(--accent-soft)', color: 'var(--accent)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 'var(--text-xs)',
                                                }}>
                                                    {(s.user?.name || '??').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{s.user?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.matric_no}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.academic_department || '—'}</td>
                                        <td>
                                            <span style={{ color: 'var(--highlight)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                                                {s.clearance_request?.current_department?.name || 'Not Started'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                            {statusBadge(s.clearance_request?.status)}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                                        No students found.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                            <button onClick={() => fetchStudents(page - 1)} disabled={page <= 1}
                                className="btn-ghost-glass" style={{ padding: '8px 14px' }}>
                                <FaChevronLeft size={12} /> Prev
                            </button>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Page {page} of {lastPage}
                            </span>
                            <button onClick={() => fetchStudents(page + 1)} disabled={page >= lastPage}
                                className="btn-ghost-glass" style={{ padding: '8px 14px' }}>
                                Next <FaChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default AllStudents;