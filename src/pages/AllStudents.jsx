import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSync, FaSearch, FaChevronLeft, FaChevronRight, FaBan, FaTrash, FaUnlock } from 'react-icons/fa';

function AllStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [blockModal, setBlockModal] = useState({ show: false, id: null, name: '' });
    const [blockReason, setBlockReason] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

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
        return (s.name || '').toLowerCase().includes(q) ||
            (s.matric_no || '').toLowerCase().includes(q);
    });

    const handleBlock = async () => {
        if (!blockReason.trim() || blockReason.length < 5) return toast.error('Provide a reason (min 5 chars)');
        try {
            await api.post('/admin/block-student', { student_id: blockModal.id, reason: blockReason });
            toast.success('Student blocked');
            setBlockModal({ show: false, id: null, name: '' });
            setBlockReason('');
            fetchStudents(page);
        } catch (err) { toast.error(err.response?.data?.message || 'Block failed'); }
    };

    const handleUnblock = async (id) => {
        try {
            await api.post('/admin/unblock-student', { student_id: id });
            toast.success('Student unblocked');
            fetchStudents(page);
        } catch (err) { toast.error(err.response?.data?.message || 'Unblock failed'); }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/delete-student/${deleteModal.id}`);
            toast.success('Student deleted');
            setDeleteModal({ show: false, id: null, name: '' });
            fetchStudents(page);
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    const statusBadge = (status) => {
        if (!status || status === 'Not Started') return <span className="badge-glass badge-muted">Not Started</span>;
        if (status === 'Completed') return <span className="badge-glass badge-success">Completed</span>;
        if (status === 'In_Progress' || status === 'in_progress') return <span className="badge-glass badge-warning">In Progress</span>;
        return <span className="badge-glass badge-muted">{status}</span>;
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
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
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
                                                    {(s.name || '??').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{s.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.matric_no}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.academic_dept || '—'}</td>
                                        <td>{statusBadge(s.status)}</td>
                                        <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                                {s.is_blocked ? (
                                                    <button onClick={() => handleUnblock(s.id)}
                                                        className="btn-success-glass" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>
                                                        <FaUnlock size={10} /> Unblock
                                                    </button>
                                                ) : (
                                                    <button onClick={() => { setBlockModal({ show: true, id: s.id, name: s.name }); setBlockReason(''); }}
                                                        className="btn-ghost-glass" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>
                                                        <FaBan size={10} /> Block
                                                    </button>
                                                )}
                                                <button onClick={() => setDeleteModal({ show: true, id: s.id, name: s.name })}
                                                    className="btn-danger-glass" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>
                                                    <FaTrash size={10} /> Delete
                                                </button>
                                            </div>
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

            {/* Block Modal */}
            {blockModal.show && (
                <div className="glass-modal-overlay" onClick={(e) => e.target === e.currentTarget && setBlockModal({ show: false, id: null, name: '' })}>
                    <div className="glass-modal">
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                            Block Student
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                            Block <strong>{blockModal.name}</strong>. They will be unable to use any features until unblocked.
                        </p>
                        <textarea className="glass-textarea" placeholder="Reason for blocking (required)..." rows={3}
                            value={blockReason} onChange={e => setBlockReason(e.target.value)}
                            style={{ marginBottom: 'var(--space-5)' }} />
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button onClick={() => setBlockModal({ show: false, id: null, name: '' })} className="btn-ghost-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Cancel
                            </button>
                            <button onClick={handleBlock} className="btn-danger-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Block Student
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="glass-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteModal({ show: false, id: null, name: '' })}>
                    <div className="glass-modal">
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>
                            Delete Student Account
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                            This will permanently remove <strong>{deleteModal.name}</strong>'s ability to log in. They will see "Account deleted by admin" if they attempt to sign in.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button onClick={() => setDeleteModal({ show: false, id: null, name: '' })} className="btn-ghost-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="btn-danger-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllStudents;