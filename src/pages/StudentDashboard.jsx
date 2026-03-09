import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import {
    FaUserGraduate, FaIdCard, FaFileUpload, FaCheckCircle,
    FaTimesCircle, FaClock, FaPaperPlane, FaSignOutAlt, FaCaretDown,
    FaHospital, FaExclamationCircle, FaEdit, FaRocket, FaCheck, FaBan
} from 'react-icons/fa';

function StudentDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [idCardFile, setIdCardFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showBypass, setShowBypass] = useState(false);
    const dropdownRef = useRef(null);
    const [bypassReason, setBypassReason] = useState('');
    const [bypassFile, setBypassFile] = useState(null);
    const [buthNumber, setButhNumber] = useState('');
    const [libraryUploadedOnline, setLibraryUploadedOnline] = useState('');
    const [specialReqFile, setSpecialReqFile] = useState(null);
    const [bursaryAccount, setBursaryAccount] = useState('');
    const [gradDate, setGradDate] = useState('');
    const [reqLoading, setReqLoading] = useState(false);
    const [appealText, setAppealText] = useState('');
    const [appealSending, setAppealSending] = useState(false);
    const [selfCollection, setSelfCollection] = useState(null);
    const [collectorData, setCollectorData] = useState({ collector_surname: '', collector_first_name: '', collector_middle_name: '', collector_relationship: '', collector_gsm: '' });
    const [collectionSubmitting, setCollectionSubmitting] = useState(false);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await api.get('/student/dashboard');
            setData(res.data);
            if (res.data?.student?.studentProfile?.buth_hospital_number) {
                setButhNumber(res.data.student.studentProfile.buth_hospital_number);
            }
        } catch (err) {
            if (err.response?.status === 401) navigate('/');
        } finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    useEffect(() => {
        const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleIdUpload = async (e) => {
        e.preventDefault();
        if (!idCardFile) return;
        setUploading(true);
        const fd = new FormData(); fd.append('id_card', idCardFile);
        try {
            await api.post('/student/upload-id-card', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('ID Card uploaded!'); fetchDashboard();
        } catch { toast.error('Upload failed (max 2MB).'); }
        finally { setUploading(false); }
    };

    const handleInitiate = async () => {
        try { setLoading(true); await api.post('/student/initiate'); toast.success('Clearance initiated!'); fetchDashboard(); }
        catch (err) { toast.error(err.response?.data?.message || 'Could not start.'); setLoading(false); }
    };

    const handleBypass = async (e) => {
        e.preventDefault();
        const fd = new FormData(); fd.append('reason', bypassReason); fd.append('stage_id', data.clearance.stage_id);
        if (bypassFile) fd.append('bypass_document', bypassFile);
        try { await api.post('/student/request-bypass', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Bypass request sent!'); setShowBypass(false); fetchDashboard(); }
        catch { toast.error('Failed to send request.'); }
    };

    const handleSpecialRequirement = async (type) => {
        const fd = new FormData(); fd.append('type', type);
        if (type === 'buth') { if (!buthNumber) return toast.error('Enter Hospital Number'); fd.append('hospital_number', buthNumber); }
        else if (type === 'library') { if (!specialReqFile) return toast.error('Attach your thesis.'); fd.append('uploaded_online', 'on'); fd.append('file', specialReqFile); }
        else if (type === 'bursary') { if (!bursaryAccount || !gradDate) return toast.error('Fill in all Bursary details.'); fd.append('bursary_account', bursaryAccount); fd.append('grad_date', gradDate); }
        try { setReqLoading(true); await api.post('/student/submit-requirement', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Requirement saved!'); fetchDashboard(); }
        catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
        finally { setReqLoading(false); }
    };

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch { }
        localStorage.clear(); toast.success('Logged out'); navigate('/');
    };

    const labelStyle = {
        display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.05em',
    };

    if (loading) return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: 200, height: 20 }} />
        </div>
    );

    const { student, clearance } = data || {};
    const profile = student?.studentProfile || {};
    const hasId = profile.id_card_path;
    const isVerified = profile.id_card_verified;
    const isCleared = clearance?.status === 'Completed';
    const isRejected = clearance?.current_status === 'Rejected';
    const needsLibraryAction = clearance?.current_dept === 'Library' && !profile.library_thesis_path;
    const needsBursaryAction = clearance?.current_dept === 'Bursary' && !profile.bursary_form_path;
    const buthStep = data?.breakdown?.find(s => s.department === 'BUTH');
    const isButhCleared = buthStep?.status === 'Approved' || buthStep?.status === 'Cleared' || buthStep?.status === 'Completed';

    const handleAppeal = async () => {
        if (!appealText.trim() || appealText.length < 10) return toast.error('Please write at least 10 characters');
        setAppealSending(true);
        try {
            await api.post('/student/appeal', { message: appealText });
            toast.success('Appeal submitted! An admin will review it.');
            setAppealText('');
        } catch (err) { toast.error(err.response?.data?.message || 'Appeal failed'); }
        finally { setAppealSending(false); }
    };

    // ── BLOCKED OVERLAY ──
    if (data?.is_blocked) {
        return (
            <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 'var(--radius-xl)',
                        background: 'var(--danger-soft)', color: 'var(--danger)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto var(--space-5)', fontSize: 28,
                    }}><FaBan /></div>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        Account Blocked
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                        Your account has been blocked by an administrator.
                    </p>
                    {data.block_reason && (
                        <div style={{
                            background: 'var(--danger-soft)', borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)', marginBottom: 'var(--space-6)',
                            border: '1px solid var(--danger)',
                        }}>
                            <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: 4 }}>Reason</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{data.block_reason}</p>
                        </div>
                    )}
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>
                        Submit an Appeal
                    </p>
                    <textarea className="glass-textarea" placeholder="Explain why your account should be unblocked (min 10 chars)..." rows={4}
                        value={appealText} onChange={e => setAppealText(e.target.value)}
                        style={{ marginBottom: 'var(--space-4)' }} />
                    <button onClick={handleAppeal} disabled={appealSending} className="btn-primary-glass" style={{ width: '100%', padding: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        {appealSending ? 'Sending...' : 'Submit Appeal'}
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate('/'); }} className="btn-ghost-glass" style={{ width: '100%', padding: 'var(--space-3)' }}>
                        <FaSignOutAlt size={12} /> Log Out
                    </button>
                </div>
            </div>
        );
    }

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
                    }}><FaUserGraduate size={16} /></div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Student Portal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <ThemeToggle />
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowDropdown(!showDropdown)} className="btn-ghost-glass" style={{ padding: '6px 14px' }}>
                            <FaUserGraduate size={13} /> {student?.name || 'Student'} <FaCaretDown size={10} />
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
                                }}><FaSignOutAlt /> Secure Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Content ── */}
            <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: 'var(--space-8) var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 350px) 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {/* Profile Card */}
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 'var(--radius-xl)',
                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto var(--space-4)',
                            }}><FaUserGraduate size={28} /></div>
                            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{student?.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>{student?.email}</p>
                            <span className="badge-glass badge-accent">{profile.matric_no || 'No Matric'}</span>
                        </div>

                        {/* ID Card Widget */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                                <FaIdCard style={{ color: 'var(--accent)' }} />
                                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>ID Card Status</span>
                            </div>
                            {isVerified ? (
                                <div className="alert-glass alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaCheckCircle /> Verified
                                </div>
                            ) : hasId ? (
                                <div>
                                    <div className="alert-glass" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <FaClock /> Under Review
                                    </div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        Your ID is being verified. Approval is needed for clearance.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="alert-glass alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                                        <FaTimesCircle /> Not Uploaded
                                    </div>
                                    <form onSubmit={handleIdUpload}>
                                        <input type="file" accept="image/*" onChange={e => setIdCardFile(e.target.files[0])}
                                            style={{ width: '100%', padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }} />
                                        <button type="submit" disabled={uploading} className="btn-primary-glass" style={{ width: '100%', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }}>
                                            {uploading ? 'Uploading...' : 'Upload ID'} <FaFileUpload size={12} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* BUTH Widget */}
                        {!isButhCleared && clearance && (
                            <div className="glass-card" style={{ borderLeft: '3px solid var(--highlight)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                                    <FaHospital style={{ color: 'var(--highlight)' }} />
                                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>BUTH Requirement</span>
                                </div>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                                    Ensure your Hospital Number is accurate before BUTH clearance.
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <input className="glass-input" value={buthNumber} placeholder="Hospital No." onChange={e => setButhNumber(e.target.value)} style={{ flex: 1 }} />
                                    <button onClick={() => handleSpecialRequirement('buth')} className="btn-primary-glass" style={{ padding: '8px 14px', fontSize: 'var(--text-xs)' }} disabled={reqLoading}>
                                        {profile.buth_hospital_number ? <><FaEdit size={10} /> Update</> : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-default)' }}>
                            <div>
                                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>Clearance Progress</h3>
                                <span style={{ fontSize: 'var(--text-sm)', color: isCleared ? 'var(--success)' : 'var(--accent)', fontWeight: 600 }}>
                                    {clearance ? (isCleared ? 'Completed 🎉' : 'In Progress') : 'Not Started'}
                                </span>
                            </div>
                            {clearance && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--accent)' }}>{clearance.progress_percent}%</div>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>Completed</span>
                                </div>
                            )}
                        </div>

                        {/* Not Started */}
                        {!clearance && (
                            <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
                                <FaRocket size={36} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 'var(--space-4)' }} />
                                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Ready to Begin?</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', maxWidth: 360, margin: '0 auto var(--space-6)' }}>
                                    Start your clearance process to generate your file and begin verification.
                                </p>
                                <button onClick={handleInitiate} className="btn-primary-glass" style={{ padding: 'var(--space-3) var(--space-8)', fontSize: 'var(--text-base)' }}>
                                    Start Clearance
                                </button>
                            </div>
                        )}

                        {clearance && (
                            <div>
                                {/* Library Action */}
                                {needsLibraryAction && (
                                    <div className="glass-card" style={{ background: 'var(--warning-soft)', border: '1px solid rgba(245,158,11,0.15)', marginBottom: 'var(--space-5)', padding: 'var(--space-5)' }}>
                                        <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                                            <FaExclamationCircle style={{ color: 'var(--warning)' }} /> Library Clearance Required
                                        </h5>
                                        <div style={{ marginBottom: 'var(--space-3)' }}>
                                            <label style={labelStyle}>Thesis uploaded online?</label>
                                            <select className="glass-select" onChange={e => setLibraryUploadedOnline(e.target.value)} value={libraryUploadedOnline}>
                                                <option value="">Select</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>
                                        {libraryUploadedOnline === 'no' && (
                                            <div className="alert-glass alert-error" style={{ marginTop: 'var(--space-2)' }}>You must upload your thesis online first.</div>
                                        )}
                                        {libraryUploadedOnline === 'yes' && (
                                            <div style={{ marginTop: 'var(--space-3)' }}>
                                                <label style={labelStyle}>Upload signed thesis (PDF)</label>
                                                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setSpecialReqFile(e.target.files[0])}
                                                    style={{ width: '100%', padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }} />
                                                <button onClick={() => handleSpecialRequirement('library')} className="btn-primary-glass" disabled={reqLoading}
                                                    style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                                                    Submit <FaPaperPlane size={11} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bursary Action */}
                                {needsBursaryAction && (
                                    <div className="glass-card" style={{ background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 'var(--space-5)', padding: 'var(--space-5)' }}>
                                        <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>💰 Bursary Clearance</h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                            <div>
                                                <label style={labelStyle}>Account Number</label>
                                                <input className="glass-input" placeholder="e.g. 123456789" value={bursaryAccount} onChange={e => setBursaryAccount(e.target.value)} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Graduation Date</label>
                                                <input className="glass-input" type="month" value={gradDate} onChange={e => setGradDate(e.target.value)} />
                                            </div>
                                        </div>

                                        {/* Certificate Collection */}
                                        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                                            <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>📜 Certificate Collection</h6>
                                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                                                Will you collect your certificate yourself?
                                            </p>
                                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                                <button onClick={() => setSelfCollection(true)}
                                                    className={selfCollection === true ? 'btn-primary-glass' : 'btn-ghost-glass'}
                                                    style={{ flex: 1, padding: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                                                    ✅ Yes, I will collect
                                                </button>
                                                <button onClick={() => setSelfCollection(false)}
                                                    className={selfCollection === false ? 'btn-primary-glass' : 'btn-ghost-glass'}
                                                    style={{ flex: 1, padding: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                                                    👤 No, someone else
                                                </button>
                                            </div>

                                            {selfCollection === false && (
                                                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                                    <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>Collector's Details</p>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                                        <div>
                                                            <label style={labelStyle}>Surname *</label>
                                                            <input className="glass-input" placeholder="Surname" value={collectorData.collector_surname}
                                                                onChange={e => setCollectorData({ ...collectorData, collector_surname: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label style={labelStyle}>First Name *</label>
                                                            <input className="glass-input" placeholder="First Name" value={collectorData.collector_first_name}
                                                                onChange={e => setCollectorData({ ...collectorData, collector_first_name: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label style={labelStyle}>Middle Name</label>
                                                            <input className="glass-input" placeholder="Middle" value={collectorData.collector_middle_name}
                                                                onChange={e => setCollectorData({ ...collectorData, collector_middle_name: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                                        <div>
                                                            <label style={labelStyle}>Relationship to Owner *</label>
                                                            <input className="glass-input" placeholder="e.g. Parent, Sibling" value={collectorData.collector_relationship}
                                                                onChange={e => setCollectorData({ ...collectorData, collector_relationship: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label style={labelStyle}>GSM Number *</label>
                                                            <input className="glass-input" type="tel" placeholder="e.g. 08012345678" value={collectorData.collector_gsm}
                                                                onChange={e => setCollectorData({ ...collectorData, collector_gsm: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={async () => {
                                            if (selfCollection === null) return toast.error('Please indicate who will collect your certificate');
                                            if (selfCollection === false && (!collectorData.collector_surname || !collectorData.collector_first_name || !collectorData.collector_relationship || !collectorData.collector_gsm)) {
                                                return toast.error('Please fill in all collector details');
                                            }
                                            setCollectionSubmitting(true);
                                            try {
                                                // Save certificate collection details
                                                await api.post('/student/certificate-collection', {
                                                    self_collection: selfCollection,
                                                    ...(!selfCollection ? collectorData : {}),
                                                });
                                                // Also submit the bursary form
                                                await handleSpecialRequirement('bursary');
                                                toast.success('Bursary form and certificate collection details saved!');
                                            } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
                                            finally { setCollectionSubmitting(false); }
                                        }} className="btn-success-glass" disabled={collectionSubmitting || reqLoading}
                                            style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                                            {collectionSubmitting ? 'Submitting...' : 'Submit Bursary Form'} <FaPaperPlane size={11} />
                                        </button>
                                    </div>
                                )}

                                {/* Current Stage Indicator */}
                                {!isCleared && !needsLibraryAction && !needsBursaryAction && (() => {
                                    const rejections = clearance.active_rejections ?? [];
                                    // Multiple parallel rejections (e.g. Stage 4)
                                    if (rejections.length > 1) {
                                        return (
                                            <div style={{ marginBottom: 'var(--space-5)' }}>
                                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                                                    🛑 Multiple Rejections — Action Required
                                                </p>
                                                {rejections.map((r, i) => (
                                                    <div key={i} className="glass-card" style={{
                                                        background: 'var(--danger-soft)',
                                                        border: '1px solid rgba(239,68,68,0.15)',
                                                        padding: 'var(--space-4)', marginBottom: 'var(--space-3)',
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                            <div>
                                                                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', marginBottom: 2 }}>
                                                                    {r.department} Department
                                                                </p>
                                                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', fontWeight: 600 }}>
                                                                    Reason: {r.reason}
                                                                </p>
                                                                {r.rejected_by && (
                                                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                                                                        Rejected by: {r.rejected_by} Desk
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button onClick={() => setShowBypass(!showBypass)} className="btn-ghost-glass" style={{ fontSize: 'var(--text-xs)', flexShrink: 0 }}>
                                                                {showBypass ? 'Cancel' : 'Reply'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    // Single rejection or waiting stage
                                    return (
                                        <div className="glass-card" style={{
                                            background: isRejected ? 'var(--danger-soft)' : 'var(--accent-soft)',
                                            border: `1px solid ${isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(59,92,235,0.1)'}`,
                                            marginBottom: 'var(--space-5)', padding: 'var(--space-5)',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                        }}>
                                            <div style={{ fontSize: 28 }}>{isRejected ? '🛑' : '📍'}</div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Current Stage</p>
                                                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>{clearance.current_dept} Department</h4>
                                                {isRejected && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', fontWeight: 600, marginTop: 4 }}>Reason: {clearance.rejection_reason}</p>}
                                                {isRejected && rejections[0]?.rejected_by && (
                                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Rejected by: {rejections[0].rejected_by} Desk</p>
                                                )}
                                            </div>
                                            {isRejected && (
                                                <button onClick={() => setShowBypass(!showBypass)} className="btn-ghost-glass" style={{ fontSize: 'var(--text-xs)' }}>
                                                    {showBypass ? 'Cancel' : 'Reply'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Bypass Form */}
                                {showBypass && (
                                    <form onSubmit={handleBypass} className="glass-card" style={{ border: '1px solid rgba(239,68,68,0.15)', marginBottom: 'var(--space-5)', padding: 'var(--space-5)' }}>
                                        <label style={labelStyle}>Explain why this should be approved</label>
                                        <textarea className="glass-textarea" rows={2} required onChange={e => setBypassReason(e.target.value)} style={{ marginBottom: 'var(--space-3)' }} />
                                        <label style={labelStyle}>Optional proof (PDF/Image)</label>
                                        <input type="file" accept=".pdf,image/*" onChange={e => setBypassFile(e.target.files[0])}
                                            style={{ width: '100%', padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }} />
                                        <button type="submit" className="btn-danger-glass" style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                                            Send Request <FaPaperPlane size={11} />
                                        </button>
                                    </form>
                                )}

                                {/* Timeline */}
                                <div style={{ marginTop: 'var(--space-4)' }}>
                                    <h6 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>
                                        Detailed Timeline
                                    </h6>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {data.breakdown?.map((step, idx) => {
                                            const isApproved = step.status === 'Approved' || step.status === 'Cleared' || step.status === 'Completed';
                                            const isRejectedStep = step.status === 'Rejected';
                                            return (
                                                <div key={idx} style={{
                                                    display: 'flex', flexDirection: 'column',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: isApproved ? 'var(--success-soft)' : isRejectedStep ? 'var(--danger-soft)' : 'transparent',
                                                    border: '1px solid var(--border-subtle)',
                                                    gap: 4,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                                                            background: isApproved ? 'var(--success)' : isRejectedStep ? 'var(--danger)' : 'var(--bg-input)',
                                                            color: isApproved || isRejectedStep ? '#fff' : 'var(--text-muted)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: 'var(--text-xs)', flexShrink: 0,
                                                        }}>
                                                            {isApproved ? <FaCheck size={11} /> : isRejectedStep ? <FaTimesCircle size={11} /> : step.sequence}
                                                        </div>
                                                        <span style={{ flex: 1, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                                            {step.department}
                                                        </span>
                                                        <span className={`badge-glass ${isApproved ? 'badge-success' : isRejectedStep ? 'badge-danger' : step.status === 'Waiting' ? 'badge-warning' : 'badge-muted'}`}>
                                                            {isApproved ? 'Approved' : step.status}
                                                        </span>
                                                    </div>
                                                    {/* Rejection details shown inline under the stage row */}
                                                    {isRejectedStep && step.rejection_reason && (
                                                        <div style={{ paddingLeft: 42, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, margin: 0 }}>
                                                                ⚠ {step.rejection_reason}
                                                            </p>
                                                            {step.rejected_by && (
                                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>
                                                                    Rejected by: {step.rejected_by} Desk
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;