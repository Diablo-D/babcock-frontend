import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    FaCheck, FaTimes, FaIdCard, FaSignOutAlt, FaSync, FaCaretDown, FaUserTie,
    FaFileAlt, FaHospital, FaBook, FaMoneyCheckAlt 
} from 'react-icons/fa';

function OfficerDashboard() {
    const [data, setData] = useState({ officer: {}, queue: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); 
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/officer/dashboard');
            setData(res.data);
        } catch (err) {
            console.error(err);
            if(err.response?.status === 403) alert("Access Denied: Officers Only");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAction = async (id, type) => {
        let reason = null;
        if (type === 'reject') {
            reason = prompt("Enter Rejection Reason:");
            if (!reason) return;
        } else {
            if (!confirm("Confirm Approval?")) return;
        }

        try {
            const endpoint = type === 'approve' ? '/officer/approve' : '/officer/reject';
            await api.post(endpoint, { clearance_id: id, reason });
            alert(`Student ${type === 'approve' ? 'Approved' : 'Rejected'}!`);
            fetchDashboard();
        } catch (err) {
            console.error(err.response?.data);
            alert("Action failed. Check console for details.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center animated-fluid-bg"><div className="text-white h4">Loading Office...</div></div>;

    // --- DEPARTMENT IDENTITY CHECKS ---
    const deptName = data.officer?.department?.toLowerCase() || '';
    const isIdOfficer = deptName.includes('id card');
    const isButhOfficer = deptName.includes('buth');
    const isLibraryOfficer = deptName.includes('library');
    const isBursaryOfficer = deptName.includes('bursary');

    return (
        <div className="animated-fluid-bg" style={{ flexDirection: "column", overflowY: "auto", minHeight: '100vh' }}>
            
            <nav className="navbar navbar-expand-lg px-4 py-3 glass-nav-fade">
                <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-circle p-2 shadow-sm">🛡️</span>
                    {data.officer.department} Office
                </span>
                
                <div className="ms-auto d-flex align-items-center gap-3">
                    <div className="position-relative">
                        <div 
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill border shadow-sm"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{cursor: 'pointer', transition: 'all 0.3s ease', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)'}}
                        >
                            <FaUserTie className="text-white"/>
                            <span className="fw-bold text-white">{data.officer.name}</span>
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
                <div className="d-flex justify-content-between align-items-center mb-4 text-white">
                    <div style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                        <h2 className="fw-bold">Clearance Queue</h2>
                        <p className="mb-0 text-white-75">Manage pending requests efficiently.</p>
                    </div>
                    <button onClick={fetchDashboard} className="btn btn-light rounded-pill shadow-sm fw-bold text-primary px-4 py-2">
                        <FaSync className={refreshing ? "fa-spin me-2" : "me-2"}/> Refresh Queue
                    </button>
                </div>

                <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                    <div className="card-body p-0">
                        {data.queue.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="display-1 mb-3">🎉</div>
                                <h4>All Caught Up!</h4>
                                <p className="text-muted">No students waiting in line.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-uppercase small fw-bold text-muted">
                                        <tr>
                                            <th className="ps-4 py-3">Student Info</th>
                                            <th>Matric No</th>
                                            <th>Date</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.queue.map(student => (
                                            <tr key={student.id}>
                                                <td className="ps-4 py-3">
                                                    <div className="fw-bold text-dark fs-6">{student.student_name}</div>
                                                    
                                                    {/* --- BYPASS REQUEST INFO --- */}
                                                    {!!student.bypass_requested && (
                                                        <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                                                            <span className="badge bg-warning text-dark shadow-sm px-2 py-1">
                                                                ⚠️ Bypass Request: {student.bypass_reason}
                                                            </span>
                                                            {student.bypass_document_url && (
                                                                <a href={student.bypass_document_url} target="_blank" rel="noreferrer" className="badge bg-danger text-white text-decoration-none shadow-sm px-2 py-1">
                                                                    <FaFileAlt className="me-1"/> View Bypass Doc
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* --- DYNAMIC DEPARTMENT REQUIREMENTS --- */}
                                                    
                                                    {/* 1. BUTH Logic */}
                                                    {isButhOfficer && (
                                                        <div className="mt-2">
                                                            <span className={`badge ${student.buth_number ? 'bg-info' : 'bg-secondary'} text-white shadow-sm px-2 py-1`}>
                                                                <FaHospital className="me-1"/> Hospital No: {student.buth_number || 'Missing'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* 2. Library Logic */}
                                                    {isLibraryOfficer && (
                                                        <div className="mt-2">
                                                            {student.library_thesis_url ? (
                                                                <a href={student.library_thesis_url} target="_blank" rel="noreferrer" className="badge bg-primary text-white text-decoration-none shadow-sm px-2 py-1">
                                                                    <FaBook className="me-1"/> View Uploaded Thesis
                                                                </a>
                                                            ) : (
                                                                <span className="badge bg-danger text-white shadow-sm px-2 py-1">No Thesis Uploaded</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 3. Bursary Logic */}
                                                    {isBursaryOfficer && (
                                                        <div className="mt-2 p-2 bg-light rounded-3 border border-success border-opacity-25 d-inline-block shadow-sm">
                                                            <div className="small fw-bold text-success d-flex align-items-center gap-1 mb-1"><FaMoneyCheckAlt/> Bursary Details</div>
                                                            <div className="small text-muted"><strong>Account:</strong> {student.bursary_account || 'Missing'}</div>
                                                            <div className="small text-muted"><strong>Grad Date:</strong> {student.bursary_grad_date || 'Missing'}</div>
                                                        </div>
                                                    )}

                                                </td>
                                                <td className="fw-bold text-primary align-middle">{student.matric_no}</td>

                                                <td className="text-muted small fw-medium align-middle">
                                                    {student.date}
                                                    {/* Fallback for ID Officer to view standard ID card */}
                                                    {isIdOfficer && student.id_card_url && (
                                                        <div className="mt-1">
                                                            <button className="btn btn-sm btn-outline-primary rounded-pill py-0 px-2 fw-bold" onClick={() => setPreviewImage(student.id_card_url)}>
                                                                <FaIdCard className="me-1"/> View ID
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="text-end pe-4 align-middle">
                                                    <button onClick={() => handleAction(student.id, 'reject')} className="btn btn-outline-danger btn-sm rounded-pill px-3 me-2 fw-bold shadow-sm">
                                                        <FaTimes className="me-1"/> Reject
                                                    </button>
                                                    <button onClick={() => handleAction(student.id, 'approve')} className="btn btn-success btn-sm rounded-pill px-3 fw-bold shadow-sm">
                                                        <FaCheck className="me-1"/> Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ID Card Modal */}
            {previewImage && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75" style={{zIndex: 1050, backdropFilter: 'blur(5px)'}} onClick={() => setPreviewImage(null)}>
                    <div className="bg-white p-2 rounded shadow-lg" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
                        <img src={previewImage} alt="ID Card" className="img-fluid rounded" />
                        <div className="text-center mt-2">
                            <button className="btn btn-sm btn-dark rounded-pill px-4" onClick={() => setPreviewImage(null)}>Close Image</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OfficerDashboard;    