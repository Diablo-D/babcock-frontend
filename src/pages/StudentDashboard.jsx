import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    FaUserGraduate, FaIdCard, FaFileUpload, FaCheckCircle, 
    FaTimesCircle, FaClock, FaSpinner, FaPaperPlane, FaSignOutAlt, FaCaretDown, FaHospital, FaExclamationCircle, FaEdit
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
    
    // Bypass States
    const [bypassReason, setBypassReason] = useState('');
    const [bypassFile, setBypassFile] = useState(null);

    // Special Requirement States
    const [buthNumber, setButhNumber] = useState('');
    const [libraryUploadedOnline, setLibraryUploadedOnline] = useState('');
    const [specialReqFile, setSpecialReqFile] = useState(null);
    
    // Digital Bursary States
    const [bursaryAccount, setBursaryAccount] = useState('');
    const [gradDate, setGradDate] = useState('');
    
    const [reqLoading, setReqLoading] = useState(false);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/student/dashboard');
            setData(res.data);
            
            // Auto-fill BUTH number if they already submitted it
            if (res.data?.student?.studentProfile?.buth_hospital_number) {
                setButhNumber(res.data.student.studentProfile.buth_hospital_number);
            }
        } catch (err) {
            console.error(err);
            if(err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    // --- STANDARD ID UPLOAD ---
    const handleIdUpload = async (e) => {
        e.preventDefault();
        if(!idCardFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('id_card', idCardFile);

        try {
            await api.post('/student/upload-id-card', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
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
        const formData = new FormData();
        formData.append('reason', bypassReason);
        formData.append('stage_id', data.clearance.stage_id);
        if (bypassFile) formData.append('bypass_document', bypassFile);

        try {
            await api.post('/student/request-bypass', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert("Bypass Request & Document Sent!");
            setShowBypass(false);
            setBypassFile(null);
            fetchDashboard();
        } catch (err) {
            alert("Failed to send request.");
        }
    };

    // --- SMART SPECIAL REQUIREMENTS HANDLER ---
    const handleSpecialRequirement = async (type) => {
        const formData = new FormData();
        formData.append('type', type);

        if (type === 'buth') {
            if (!buthNumber) return alert('Enter Hospital Number');
            formData.append('hospital_number', buthNumber);
        } else if (type === 'library') {
            if (!specialReqFile) return alert('Please attach your signed thesis.');
            formData.append('uploaded_online', 'on');
            formData.append('file', specialReqFile);
        } else if (type === 'bursary') {
            if (!bursaryAccount || !gradDate) return alert('Please fill in all Bursary details.');
            formData.append('bursary_account', bursaryAccount);
            formData.append('grad_date', gradDate);
        }

        try {
            setReqLoading(true);
            await api.post('/student/submit-requirement', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert('Requirement saved successfully!');
            fetchDashboard();
        } catch(err) {
            alert(err.response?.data?.message || 'Submission failed');
        } finally {
            setReqLoading(false);
        }
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
    const profile = student?.studentProfile || {};
    
    const hasId = profile.id_card_path;
    const isVerified = profile.id_card_verified;
    const isCleared = clearance?.status === 'Completed';
    const isRejected = clearance?.current_status === 'Rejected';

    const needsLibraryAction = clearance?.current_dept === 'Library' && !profile.library_thesis_path;
    const needsBursaryAction = clearance?.current_dept === 'Bursary' && !profile.bursary_form_path;

    // ✅ THE BUG FIX: Checking for both 'Approved' and 'Cleared' to handle the backend vocabulary
    const buthStep = data?.breakdown?.find(step => step.department === 'BUTH');
    const isButhCleared = buthStep?.status === 'Approved' || buthStep?.status === 'Cleared' || buthStep?.status === 'Completed';

    return (
        <div className="animated-fluid-bg" style={{ flexDirection: "column", overflowY: "auto", minHeight: "100vh" }}>
            
            <nav className="navbar navbar-expand-lg px-4 py-3 glass-nav-fade">
                <span className="navbar-brand fw-bold fs-4 text-white d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-circle p-2 shadow-sm">🎓</span>
                    Student Portal
                </span>
                
                <div className="ms-auto d-flex align-items-center gap-3">
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
                                <button onClick={() => { localStorage.clear(); navigate('/'); }} className="btn w-100 text-start px-3 py-3 text-danger bg-transparent border-0 hover-bg-light d-flex align-items-center fw-bold">
                                    <FaSignOutAlt className="me-2"/> Secure Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="container py-4 flex-grow-1">
                <div className="row g-4">
                    
                    {/* --- LEFT COLUMN --- */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 p-4 text-center" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{width:'90px', height:'90px'}}>
                                <FaUserGraduate className="fs-1 text-primary"/>
                            </div>
                            <h4 className="fw-bold mb-1 text-dark">{student?.name}</h4>
                            <p className="text-muted small mb-3">{student?.email}</p>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-3 py-2">
                                {profile.matric_no || "No Matric"}
                            </span>
                        </div>

                        {/* ID Card Widget */}
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden p-4 mb-4" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                            <h6 className="fw-bold border-bottom pb-2 mb-3 d-flex align-items-center gap-2 text-dark">
                                <FaIdCard className="text-primary"/> ID Card Status
                            </h6>
                            {isVerified ? (
                                <div className="alert alert-success d-flex align-items-center gap-2 border-0 shadow-sm fw-bold"><FaCheckCircle/> Verified</div>
                            ) : hasId ? (
                                <div className="text-center">
                                    <div className="alert alert-warning border-0 shadow-sm mb-3 fw-bold text-dark"><FaClock className="me-2"/> Under Review</div>
                                    <small className="text-muted d-block lh-sm">Your ID is currently being checked. Approval is needed for final clearance.</small>
                                </div>
                            ) : (
                                <div>
                                    <div className="alert alert-danger border-0 shadow-sm py-2 mb-3 small fw-bold"><FaTimesCircle className="me-1"/> Not Uploaded</div>
                                    <form onSubmit={handleIdUpload}>
                                        <input type="file" className="form-control mb-3 bg-light border-0" accept="image/*" onChange={e => setIdCardFile(e.target.files[0])} required />
                                        <button className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" disabled={uploading}>
                                            {uploading ? 'Uploading...' : 'Upload ID'} <FaFileUpload className="ms-2"/>
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* ✅ EDITABLE BUTH WIDGET (Remains until BUTH clears them) */}
                        {!isButhCleared && clearance && (
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden p-4 border-start border-4 border-info" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-dark"><FaHospital className="text-info"/> BUTH Requirement</h6>
                                <p className="small text-muted mb-3">Ensure your Hospital Number is accurate before the BUTH clearance stage.</p>
                                <div className="input-group">
                                    <input type="text" className="form-control bg-light border-0" value={buthNumber} placeholder="Hospital Number" onChange={e => setButhNumber(e.target.value)} />
                                    <button onClick={() => handleSpecialRequirement('buth')} className="btn btn-info text-white fw-bold px-3" disabled={reqLoading}>
                                        {profile.buth_hospital_number ? <><FaEdit/> Update</> : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: CLEARANCE TRACKER --- */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden p-4 h-100" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                            
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                <div>
                                    <h4 className="fw-bold mb-0 text-dark">Clearance Progress</h4>
                                    <small className="text-muted">Status: <span className={isCleared ? "text-success fw-bold" : "text-primary fw-bold"}>{clearance ? (isCleared ? "Completed 🎉" : "In Progress ⏳") : "Not Started"}</span></small>
                                </div>
                                {clearance && (
                                    <div className="text-end">
                                        <div className="h3 fw-bold text-primary mb-0">{clearance.progress_percent}%</div>
                                        <small className="text-muted fw-bold">Completed</small>
                                    </div>
                                )}
                            </div>

                            {!clearance && (
                                <div className="text-center py-5">
                                    <div className="display-1 text-muted opacity-25 mb-3">🚀</div>
                                    <h3 className="fw-bold text-dark">Ready to Begin?</h3>
                                    <p className="text-muted mb-4 px-5">Initiate your clearance to generate your file and start the verification process.</p>
                                    <button onClick={handleInitiate} className="btn btn-primary py-3 px-5 fw-bold rounded-pill shadow-lg">Start Clearance Process</button>
                                </div>
                            )}

                            {clearance && (
                                <div>
                                    {/* 🔴 SCENARIO: ACTION REQUIRED (LIBRARY) */}
                                    {needsLibraryAction && (
                                        <div className="alert alert-warning border-0 shadow-sm p-4 mb-4 rounded-4">
                                            <h5 className="fw-bold text-dark d-flex align-items-center gap-2"><FaExclamationCircle className="text-warning"/> Action Required: Library Clearance</h5>
                                            <hr className="opacity-25 my-3"/>
                                            <label className="fw-bold text-dark mb-2">1. Have you uploaded your thesis online?</label>
                                            <select className="form-select bg-white border-0 mb-3" onChange={e => setLibraryUploadedOnline(e.target.value)}>
                                                <option value="">-- Select --</option>
                                                <option value="yes">Yes, I have</option>
                                                <option value="no">No, I have not</option>
                                            </select>
                                            
                                            {libraryUploadedOnline === 'no' && <div className="alert alert-danger border-0 small py-2 fw-bold">⚠️ You must upload your thesis online before proceeding.</div>}
                                            
                                            {libraryUploadedOnline === 'yes' && (
                                                <div className="mt-3 p-3 bg-white rounded-3 shadow-sm border border-warning border-opacity-25">
                                                    <label className="fw-bold text-dark mb-2 small">2. Upload your physical submitted/signed thesis (PDF)</label>
                                                    <input type="file" className="form-control bg-light border-0 mb-3" accept=".pdf,.doc,.docx" onChange={e => setSpecialReqFile(e.target.files[0])} />
                                                    <button onClick={() => handleSpecialRequirement('library')} className="btn btn-warning fw-bold w-100 rounded-pill shadow-sm" disabled={reqLoading}>
                                                        Submit Library Requirements <FaPaperPlane className="ms-2"/>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 🟢 SCENARIO: DIGITAL BURSARY FORM */}
                                    {needsBursaryAction && (
                                        <div className="alert alert-success bg-opacity-10 border-0 shadow-sm p-4 mb-4 rounded-4">
                                            <h5 className="fw-bold text-dark d-flex align-items-center gap-2">💰 Action Required: Bursary Clearance</h5>
                                            <p className="small text-muted mb-4">Please fill out your digital Bursary details to proceed.</p>
                                            
                                            <div className="p-3 bg-white rounded-3 shadow-sm border border-success border-opacity-25">
                                                <div className="row g-3 mb-3">
                                                    <div className="col-md-6">
                                                        <label className="fw-bold text-dark mb-1 small">Bursary Account Number</label>
                                                        <input type="text" className="form-control bg-light border-0" placeholder="E.g. 123456789" value={bursaryAccount} onChange={e => setBursaryAccount(e.target.value)} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="fw-bold text-dark mb-1 small">Expected Graduation Date</label>
                                                        <input type="month" className="form-control bg-light border-0" value={gradDate} onChange={e => setGradDate(e.target.value)} />
                                                    </div>
                                                </div>
                                                <button onClick={() => handleSpecialRequirement('bursary')} className="btn btn-success fw-bold w-100 rounded-pill shadow-sm" disabled={reqLoading}>
                                                    Digitally Sign & Submit <FaPaperPlane className="ms-2"/>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🔵 SCENARIO: NORMAL IN PROGRESS / REJECTED */}
                                    {!isCleared && !needsLibraryAction && !needsBursaryAction && (
                                        <div className={`alert border-0 shadow-sm d-flex align-items-center gap-3 p-3 mb-4 ${isRejected ? 'alert-danger' : 'alert-primary bg-primary bg-opacity-10'}`}>
                                            <div className="fs-2">{isRejected ? '🛑' : '📍'}</div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1 text-uppercase small opacity-75 text-dark">Current Stage</h6>
                                                <h4 className="fw-bold mb-0 text-dark">{clearance.current_dept} Department</h4>
                                                {isRejected && <small className="d-block mt-1 text-danger fw-bold">Reason: {clearance.rejection_reason}</small>}
                                            </div>
                                            
                                            {isRejected && (
                                                <button onClick={() => setShowBypass(!showBypass)} className="btn btn-sm btn-light fw-bold text-danger shadow-sm rounded-pill px-3">
                                                    {showBypass ? 'Cancel' : 'Reply / Bypass'}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* BYPASS FORM WITH OPTIONAL UPLOAD */}
                                    {showBypass && (
                                        <form onSubmit={handleBypass} className="bg-white p-4 mb-4 border border-danger rounded-4 shadow-sm">
                                            <label className="small fw-bold text-danger mb-2">Explain why this should be approved:</label>
                                            <textarea className="form-control mb-3 bg-light border-0" rows="2" required onChange={e => setBypassReason(e.target.value)}></textarea>
                                            
                                            <label className="small fw-bold text-dark mb-2">Optional Proof/Document (PDF/Image):</label>
                                            <input type="file" className="form-control bg-light border-0 mb-3" accept=".pdf,image/*" onChange={e => setBypassFile(e.target.files[0])} />
                                            
                                            <button className="btn btn-danger py-2 w-100 rounded-pill fw-bold shadow-sm" style={{fontSize: '0.9rem'}}>
                                                Send Request & Document <FaPaperPlane className="ms-2"/>
                                            </button>
                                        </form>
                                    )}

                                    {/* ✅ THE FIX: Added 'Approved' into the timeline checks */}
                                    <div className="mt-4">
                                        <h6 className="fw-bold text-muted text-uppercase small mb-3">Detailed Timeline</h6>
                                        <div className="table-responsive">
                                            <table className="table align-middle table-hover">
                                                <tbody>
                                                    {data.breakdown?.map((step, idx) => {
                                                        const isStepApproved = step.status === 'Approved' || step.status === 'Cleared' || step.status === 'Completed';
                                                        
                                                        return (
                                                            <tr key={idx}>
                                                                <td style={{width: '50px'}}>
                                                                    <div className={`rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold shadow-sm ${
                                                                        isStepApproved ? 'bg-success' : 
                                                                        (step.status === 'Rejected' ? 'bg-danger' : 'bg-secondary bg-opacity-25 text-muted')
                                                                    }`} style={{width: '32px', height: '32px'}}>
                                                                        {step.sequence}
                                                                    </div>
                                                                </td>
                                                                <td className="fw-bold text-dark">{step.department}</td>
                                                                <td className="text-end">
                                                                    {isStepApproved && <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Approved</span>}
                                                                    {step.status === 'Rejected' && <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Rejected</span>}
                                                                    {step.status === 'Waiting' && <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 text-dark">Processing</span>}
                                                                    {step.status === 'Pending' && <span className="badge bg-secondary bg-opacity-10 text-muted rounded-pill px-3">Pending</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
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