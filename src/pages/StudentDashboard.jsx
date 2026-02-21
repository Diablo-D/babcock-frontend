import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    FaUserGraduate, FaIdCard, FaFileUpload, FaCheckCircle, 
    FaTimesCircle, FaClock, FaSpinner, FaPaperPlane, FaSignOutAlt, FaCaretDown 
} from 'react-icons/fa';

function StudentDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [idCardFile, setIdCardFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // UI States
    const [showDropdown, setShowDropdown] = useState(false);
    const [showBypass, setShowBypass] = useState(false);
    const [bypassReason, setBypassReason] = useState('');

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/student/dashboard');
            setData(res.data);
        } catch (err) {
            console.error(err);
            if(err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleIdUpload = async (e) => {
        e.preventDefault();
        if(!idCardFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('id_card', idCardFile);

        try {
            await api.post('/student/upload-id-card', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("ID Card Uploaded! Pending Verification.");
            fetchDashboard(); 
        } catch (err) {
            alert("Upload failed. Image must be under 2MB.");
        } finally {
            setUploading(false);
        }
    };

    const handleInitiate = async () => {
        if(!window.confirm("Start your clearance process now?")) return;
        try {
            setLoading(true);
            await api.post('/student/initiate');
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.message || "Could not start.");
            setLoading(false);
        }
    };

    const handleBypass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/student/request-bypass', {
                reason: bypassReason,
                stage_id: data.clearance.stage_id
            });
            alert("Bypass Request Sent!");
            setShowBypass(false);
            fetchDashboard();
        } catch (err) {
            alert("Failed to send request.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return (
        <div className="animated-fluid-bg d-flex align-items-center justify-content-center">
            <div className="glass-card p-5 text-center bg-white bg-opacity-75">
                <FaSpinner className="fs-1 text-primary fa-spin mb-3"/>
                <h5 className="text-dark fw-bold">Loading Portal...</h5>
            </div>
        </div>
    );

    const { student, clearance } = data || {};
    const hasId = student?.studentProfile?.id_card_path;
    const isVerified = student?.studentProfile?.id_card_verified;
    const isCleared = clearance?.status === 'Completed';
    const isRejected = clearance?.current_status === 'Rejected';

    return (
        <div className="animated-fluid-bg" style={{ flexDirection: "column", overflowY: "auto", minHeight: "100vh" }}>
            
            {/* --- NAVBAR --- */}
            <nav className="navbar navbar-expand-lg px-4 py-3 glass-nav-fade">
                <span className="navbar-brand fw-bold fs-4 text-white d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-circle p-2 shadow-sm">🎓</span>
                    Student Portal
                </span>
                
                <div className="ms-auto d-flex align-items-center gap-3">
                    {/* ✅ Standardized Profile Dropdown */}
                    <div className="position-relative">
                        <div 
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill border shadow-sm"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{cursor: 'pointer', transition: 'all 0.3s ease', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)'}}
                        >
                            <FaUserGraduate className="text-white"/>
                            <span className="fw-bold text-white">{student?.name || 'Student'}</span>
                            <FaCaretDown className="text-white-50"/>
                        </div>
                        
                        {showDropdown && (
                            <div className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3 overflow-hidden border" style={{minWidth: '180px', zIndex: 1000}}>
                                <button onClick={handleLogout} className="btn w-100 text-start px-3 py-3 text-danger bg-transparent border-0 hover-bg-light d-flex align-items-center fw-bold">
                                    <FaSignOutAlt className="me-2"/> Secure Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="container py-4 flex-grow-1">
                <div className="row g-4">
                    
                    {/* --- LEFT COLUMN: PROFILE & ID CARD --- */}
                    <div className="col-lg-4">
                        {/* Profile Card */}
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 p-4 text-center" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{width:'90px', height:'90px'}}>
                                <FaUserGraduate className="fs-1 text-primary"/>
                            </div>
                            <h4 className="fw-bold mb-1 text-dark">{student?.name}</h4>
                            <p className="text-muted small mb-3">{student?.email}</p>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-3 py-2">
                                {student?.studentProfile?.matric_no || "No Matric"}
                            </span>
                        </div>

                        {/* ID Card Widget */}
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden p-4" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                            <h6 className="fw-bold border-bottom pb-2 mb-3 d-flex align-items-center gap-2 text-dark">
                                <FaIdCard className="text-primary"/> ID Card Status
                            </h6>
                            
                            {isVerified ? (
                                <div className="alert alert-success d-flex align-items-center gap-2 border-0 shadow-sm fw-bold">
                                    <FaCheckCircle/> Verified
                                </div>
                            ) : hasId ? (
                                <div className="text-center">
                                    <div className="alert alert-warning border-0 shadow-sm mb-3 fw-bold text-dark">
                                        <FaClock className="me-2"/> Under Review
                                    </div>
                                    <small className="text-muted d-block lh-sm">
                                        Your ID is currently being checked by the admin. You can proceed, but approval is needed for final clearance.
                                    </small>
                                </div>
                            ) : (
                                <div>
                                    <div className="alert alert-danger border-0 shadow-sm py-2 mb-3 small fw-bold">
                                        <FaTimesCircle className="me-1"/> Not Uploaded
                                    </div>
                                    <form onSubmit={handleIdUpload}>
                                        <input 
                                            type="file" 
                                            className="form-control mb-3 bg-light border-0" 
                                            accept="image/*"
                                            onChange={e => setIdCardFile(e.target.files[0])}
                                            required 
                                        />
                                        <button className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" disabled={uploading}>
                                            {uploading ? 'Uploading...' : 'Upload ID'} <FaFileUpload className="ms-2"/>
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: CLEARANCE TRACKER --- */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden p-4 h-100" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                            
                            {/* Header Section */}
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                <div>
                                    <h4 className="fw-bold mb-0 text-dark">Clearance Progress</h4>
                                    <small className="text-muted">
                                        Status: <span className={isCleared ? "text-success fw-bold" : "text-primary fw-bold"}>
                                            {clearance ? (isCleared ? "Completed 🎉" : "In Progress ⏳") : "Not Started"}
                                        </span>
                                    </small>
                                </div>
                                {clearance && (
                                    <div className="text-end">
                                        <div className="h3 fw-bold text-primary mb-0">{clearance.progress_percent}%</div>
                                        <small className="text-muted fw-bold">Completed</small>
                                    </div>
                                )}
                            </div>

                            {/* --- SCENARIO A: NOT STARTED --- */}
                            {!clearance && (
                                <div className="text-center py-5">
                                    <div className="display-1 text-muted opacity-25 mb-3">🚀</div>
                                    <h3 className="fw-bold text-dark">Ready to Begin?</h3>
                                    <p className="text-muted mb-4 px-5">
                                        Initiate your clearance to generate your file and start the verification process.
                                    </p>
                                    <button onClick={handleInitiate} className="btn btn-primary py-3 px-5 fw-bold rounded-pill shadow-lg">
                                        Start Clearance Process
                                    </button>
                                </div>
                            )}

                            {/* --- SCENARIO B: IN PROGRESS --- */}
                            {clearance && (
                                <div>
                                    {/* Current Stage Highlight */}
                                    {!isCleared && (
                                        <div className={`alert border-0 shadow-sm d-flex align-items-center gap-3 p-3 mb-4 ${isRejected ? 'alert-danger' : 'alert-primary bg-primary bg-opacity-10'}`}>
                                            <div className="fs-2">{isRejected ? '🛑' : '📍'}</div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1 text-uppercase small opacity-75 text-dark">Current Stage</h6>
                                                <h4 className="fw-bold mb-0 text-dark">{clearance.current_dept} Department</h4>
                                                {isRejected && <small className="d-block mt-1 text-danger fw-bold">Reason: {clearance.rejection_reason}</small>}
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            {isRejected && (
                                                <button 
                                                    onClick={() => setShowBypass(!showBypass)} 
                                                    className="btn btn-sm btn-light fw-bold text-danger shadow-sm rounded-pill px-3"
                                                >
                                                    {showBypass ? 'Cancel' : 'Reply / Bypass'}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Bypass Form */}
                                    {showBypass && (
                                        <form onSubmit={handleBypass} className="bg-white p-3 mb-4 border border-danger rounded-3 shadow-sm">
                                            <label className="small fw-bold text-danger mb-2">Explain why this should be approved:</label>
                                            <textarea 
                                                className="form-control mb-3 bg-light border-0" 
                                                rows="2" 
                                                required
                                                onChange={e => setBypassReason(e.target.value)}
                                            ></textarea>
                                            <button className="btn btn-danger py-2 px-4 rounded-pill fw-bold shadow-sm" style={{fontSize: '0.9rem'}}>
                                                Send Request <FaPaperPlane className="ms-2"/>
                                            </button>
                                        </form>
                                    )}

                                    {/* Timeline */}
                                    <div className="mt-4">
                                        <h6 className="fw-bold text-muted text-uppercase small mb-3">Detailed Timeline</h6>
                                        <div className="table-responsive">
                                            <table className="table align-middle table-hover">
                                                <tbody>
                                                    {data.breakdown?.map((step, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{width: '50px'}}>
                                                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold shadow-sm ${
                                                                    step.status === 'Cleared' ? 'bg-success' : 
                                                                    (step.status === 'Rejected' ? 'bg-danger' : 'bg-secondary bg-opacity-25 text-muted')
                                                                }`} style={{width: '32px', height: '32px'}}>
                                                                    {step.sequence}
                                                                </div>
                                                            </td>
                                                            <td className="fw-bold text-dark">
                                                                {step.department}
                                                            </td>
                                                            <td className="text-end">
                                                                {step.status === 'Cleared' && <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Cleared</span>}
                                                                {step.status === 'Rejected' && <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Rejected</span>}
                                                                {step.status === 'Waiting' && <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 text-dark">Processing</span>}
                                                                {step.status === 'Pending' && <span className="badge bg-secondary bg-opacity-10 text-muted rounded-pill px-3">Pending</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;