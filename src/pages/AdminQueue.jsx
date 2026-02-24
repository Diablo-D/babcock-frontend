import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSync, FaCheck, FaTimes, FaUser } from 'react-icons/fa';

function AdminQueue() {
    const { deptName } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState({ show: false, id: null });
    const [rejectReason, setRejectReason] = useState('');

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/queue/${encodeURIComponent(deptName)}`);
            setStudents(res.data.students || res.data);
        } catch (err) { toast.error('Failed to load queue'); }
        finally { setLoading(false); }
    }, [deptName]);

    useEffect(() => { fetchQueue(); }, [fetchQueue]);

    const handleApprove = async (clearanceId) => {
        try {
            await api.post('/admin/approve-student', { clearance_id: clearanceId });
            toast.success('Student approved');
            fetchQueue();
        } catch (err) { toast.error(err.response?.data?.message || 'Approve failed'); }
    };

    const openRejectModal = (id) => {
        setRejectModal({ show: true, id });
        setRejectReason('');
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error('Please provide a rejection reason');
        try {
            await api.post('/admin/reject-student', { clearance_id: rejectModal.id, reason: rejectReason });
            toast.success('Student rejected');
            setRejectModal({ show: false, id: null });
            fetchQueue();
        } catch (err) { toast.error(err.response?.data?.message || 'Reject failed'); }
    };

    return (
        <div className="page-container page-enter">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                        <Link to="/admin/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex' }}>
                            <FaArrowLeft size={14} />
                        </Link>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {deptName} Queue
                        </h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        {students.length} student{students.length !== 1 ? 's' : ''} waiting
                    </p>
                </div>
                <button onClick={fetchQueue} className="btn-ghost-glass">
                    <FaSync size={12} /> Refresh
                </button>
            </div>

            {/* Queue Table */}
            {loading ? (
                <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
            ) : students.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                    <FaUser size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>Queue is Empty</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No students waiting in this department.</p>
                </div>
            ) : (
                <div className="glass-table-wrap">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-6)' }}>Student</th>
                                <th>Matric No</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td style={{ paddingLeft: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: 'var(--text-xs)',
                                            }}>
                                                {(s.student_name || '??').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{s.student_name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.matric_no}</span></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                            <button onClick={() => openRejectModal(s.id)} className="btn-danger-glass"
                                                style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
                                                <FaTimes size={10} /> Reject
                                            </button>
                                            <button onClick={() => handleApprove(s.id)} className="btn-success-glass"
                                                style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
                                                <FaCheck size={10} /> Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.show && (
                <div className="glass-modal-overlay" onClick={(e) => e.target === e.currentTarget && setRejectModal({ show: false, id: null })}>
                    <div className="glass-modal">
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                            Reject Student
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                            Provide a reason for rejection. The student will be notified.
                        </p>
                        <textarea className="glass-textarea" placeholder="Enter rejection reason..." rows={3}
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            style={{ marginBottom: 'var(--space-5)' }} />
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button onClick={() => setRejectModal({ show: false, id: null })} className="btn-ghost-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Cancel
                            </button>
                            <button onClick={handleReject} className="btn-danger-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminQueue;