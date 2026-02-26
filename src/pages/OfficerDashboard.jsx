import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import {
    FaCheck, FaTimes, FaSignOutAlt, FaSync, FaCaretDown, FaUserTie,
    FaIdCard, FaHospital, FaBook, FaMoneyCheckAlt, FaEye, FaFileAlt, FaDownload
} from 'react-icons/fa';

// ── Sub-component: renders the main student queue table ──────────────────────
function QueueTable({
    queue, searchTerm, setSearchTerm, groupFilter, setGroupFilter,
    isIdOfficer, isButhOfficer, isLibraryOfficer, isBursaryOfficer,
    setPreviewImage, setShowRejectModal, setRejectReason, handleApprove,
}) {
    const filteredQueue = queue.filter(s => {
        const matchSearch = String(s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(s.matric_no || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchGroup = groupFilter === 'All' || s.academic_dept === groupFilter;
        return matchSearch && matchGroup;
    });
    const uniqueDepts = Array.from(new Set(queue.map(s => s.academic_dept).filter(Boolean)));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Search + Filter bar */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search by name or matric..."
                    className="glass-input"
                    style={{ flex: '1 1 300px' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {uniqueDepts.length > 0 && (
                    <select
                        className="glass-select"
                        style={{ flex: '0 1 200px' }}
                        value={groupFilter}
                        onChange={e => setGroupFilter(e.target.value)}
                    >
                        <option value="All">All Departments</option>
                        {uniqueDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                )}
            </div>

            {/* Table */}
            <div className="glass-table-wrap" style={{ width: '100%', overflowX: 'auto' }}>
                <table className="glass-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 'var(--space-6)' }}>Student</th>
                            <th>Matric No</th>
                            <th>Date</th>
                            {isIdOfficer && <th>ID Card</th>}
                            {isButhOfficer && <th>Hospital No</th>}
                            {isLibraryOfficer && <th>Thesis</th>}
                            {isBursaryOfficer && <th>Account</th>}
                            <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQueue.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                                    No students match your search.
                                </td>
                            </tr>
                        ) : filteredQueue.map(s => {
                            const isRejected = s.status === 'Rejected';

                            return (
                                <tr key={s.clearance_id} style={{ opacity: isRejected ? 0.7 : 1 }}>
                                    <td style={{ paddingLeft: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                                background: isRejected ? 'var(--bg-card)' : 'var(--accent-soft)',
                                                color: isRejected ? 'var(--danger)' : 'var(--accent)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: 'var(--text-xs)',
                                                border: isRejected ? '1px solid var(--danger)' : 'none'
                                            }}>
                                                {(s.name || '??').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</span>
                                                {s.academic_dept && (
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.academic_dept}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.matric_no}</span></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {s.date ? new Date(s.date).toLocaleString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                        }) : '—'}
                                    </td>
                                    {isIdOfficer && (
                                        <td>
                                            {s.id_card_url ? (
                                                <button onClick={() => setPreviewImage(s.id_card_url)}
                                                    className="btn-outline-glass" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>
                                                    <FaEye size={10} /> View
                                                </button>
                                            ) : <span className="badge-glass badge-warning">Not Uploaded</span>}
                                        </td>
                                    )}
                                    {isButhOfficer && <td style={{ fontSize: 'var(--text-sm)' }}>{s.buth_number || '—'}</td>}
                                    {isLibraryOfficer && (
                                        <td>
                                            {s.library_thesis_url ? (
                                                <button onClick={() => setPreviewImage(s.library_thesis_url)}
                                                    className="btn-outline-glass" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>
                                                    <FaEye size={10} /> View
                                                </button>
                                            ) : <span className="badge-glass badge-warning">Not Uploaded</span>}
                                        </td>
                                    )}
                                    {isBursaryOfficer && (
                                        <td style={{ fontSize: 'var(--text-sm)' }}>
                                            <div>{s.bursary_account || '—'}</div>
                                            {s.certificate_collection && (
                                                <span className={`badge-glass ${s.certificate_collection.self_collection ? 'badge-success' : 'badge-warning'}`}
                                                    style={{ fontSize: '10px', marginTop: 4, display: 'inline-block' }}>
                                                    {s.certificate_collection.self_collection
                                                        ? 'Self'
                                                        : `Proxy: ${s.certificate_collection.collector_name}`}
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                        {isRejected ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                                <span className="badge-glass badge-danger" style={{ fontSize: '10px' }}>
                                                    Rejected
                                                </span>
                                                {s.rejection_reason && (
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.rejection_reason}>
                                                        {s.rejection_reason}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => { setShowRejectModal(s.clearance_id); setRejectReason(''); }}
                                                    className="btn-danger-glass"
                                                    style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
                                                    <FaTimes size={10} /> Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(s.clearance_id)}
                                                    className="btn-success-glass"
                                                    style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
                                                    <FaCheck size={10} /> Approve
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function OfficerDashboard() {
    const [data, setData] = useState({ officer: {}, queue: [] });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('All');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchDashboard = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('/officer/dashboard');
            setData(res.data);
            if (isRefresh) toast.success('Queue refreshed');
        } catch (err) {
            if (err.response?.status === 403) toast.error('Access denied');
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.post('/officer/approve', { clearance_id: id });
            toast.success('Student approved!');
            fetchDashboard();
        } catch (err) { toast.error(err.response?.data?.message || 'Approval failed'); }
    };

    const handleReject = async (id) => {
        if (!rejectReason || rejectReason.length < 5) return toast.error('Provide a reason (min 5 chars)');
        try {
            await api.post('/officer/reject', { clearance_id: id, reason: rejectReason });
            toast.success('Student rejected!');
            setShowRejectModal(null);
            setRejectReason('');
            fetchDashboard();
        } catch (err) { toast.error(err.response?.data?.message || 'Rejection failed'); }
    };

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) { }
        localStorage.clear();
        toast.success('Logged out');
        navigate('/');
    };

    if (loading) return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: 200, height: 20 }} />
        </div>
    );

    const deptName = data.officer?.department?.toLowerCase() || '';
    const isIdOfficer = deptName.includes('id card');
    const isButhOfficer = deptName.includes('buth');
    const isLibraryOfficer = deptName.includes('library');
    const isBursaryOfficer = deptName.includes('bursary');

    const deptIcon = isIdOfficer ? <FaIdCard /> : isButhOfficer ? <FaHospital /> :
        isLibraryOfficer ? <FaBook /> : isBursaryOfficer ? <FaMoneyCheckAlt /> : <FaFileAlt />;

    return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* ── Navbar ── */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'transparent',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{deptIcon}</div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                        {data.officer.department} Office
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <ThemeToggle />
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowDropdown(!showDropdown)} className="btn-ghost-glass" style={{ padding: '6px 14px' }}>
                            <FaUserTie size={13} /> {data.officer.name} <FaCaretDown size={10} />
                        </button>
                        {showDropdown && (
                            <div style={{
                                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                                background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)',
                                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--glass-shadow-lg)', minWidth: 180, overflow: 'hidden',
                                animation: 'slideDown var(--duration-normal) var(--ease-out)',
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

            {/* ── Content ── */}
            <div className="page-container page-enter">
                <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                            Clearance Queue
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            {data.queue.length} student{data.queue.length !== 1 ? 's' : ''} pending review
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        {isBursaryOfficer && (
                            <button onClick={async () => {
                                try {
                                    const res = await api.get('/officer/collection-data', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                    const a = document.createElement('a'); a.href = url; a.download = 'certificate_collections.csv'; a.click();
                                    toast.success('CSV downloaded');
                                } catch (err) { toast.error('Download failed'); }
                            }} className="btn-ghost-glass" style={{ fontSize: 'var(--text-sm)' }}>
                                <FaDownload size={12} /> Collection Data
                            </button>
                        )}
                        <button onClick={() => fetchDashboard(true)} disabled={refreshing} className="btn-ghost-glass">
                            <FaSync size={12} style={refreshing ? { animation: 'spin 0.8s linear infinite' } : {}} /> {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {data.queue.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                        <FaCheck size={32} style={{ color: 'var(--success)', marginBottom: 'var(--space-4)' }} />
                        <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>All Caught Up!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No students pending in your queue.</p>
                    </div>
                ) : (
                    <QueueTable
                        queue={data.queue}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        groupFilter={groupFilter}
                        setGroupFilter={setGroupFilter}
                        isIdOfficer={isIdOfficer}
                        isButhOfficer={isButhOfficer}
                        isLibraryOfficer={isLibraryOfficer}
                        isBursaryOfficer={isBursaryOfficer}
                        setPreviewImage={setPreviewImage}
                        setShowRejectModal={setShowRejectModal}
                        setRejectReason={setRejectReason}
                        handleApprove={handleApprove}
                    />
                )}
            </div>

            {/* ── Reject Modal ── */}
            {showRejectModal && (
                <div className="glass-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowRejectModal(null)}>
                    <div className="glass-modal">
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                            Reject Student
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                            Provide a clear reason for rejection.
                        </p>
                        <textarea className="glass-textarea" placeholder="Reason for rejection..." rows={3}
                            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                            style={{ marginBottom: 'var(--space-5)' }} />
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button onClick={() => setShowRejectModal(null)} className="btn-ghost-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Cancel
                            </button>
                            <button onClick={() => handleReject(showRejectModal)} className="btn-danger-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Image Preview ── */}
            {previewImage && (
                <div className="glass-modal-overlay" onClick={() => setPreviewImage(null)}>
                    <div style={{
                        maxWidth: 500, width: '90%', borderRadius: 'var(--radius-xl)',
                        overflow: 'hidden', boxShadow: 'var(--glass-shadow-lg)',
                    }}>
                        <img src={previewImage} alt="ID Card" style={{ width: '100%', display: 'block' }} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default OfficerDashboard;