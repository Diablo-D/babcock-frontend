import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaCheck, FaTimes, FaIdCard, FaSignOutAlt, FaSync, FaCaretDown, FaUserTie } from 'react-icons/fa';

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
        navigate('/login');
    };

    if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center">Loading Office...</div>;

    const isIdOfficer = data.officer?.department?.toLowerCase().includes('id card');

    return (
        // ✅ Applied the global fluid background class here
        <div className="animated-fluid-bg" style={{ flexDirection: "column", overflowY: "auto" }}>
            
            {/* ✅ Applied the new glass-nav-fade here */}
            <nav className="navbar navbar-expand-lg px-4 py-3 glass-nav-fade">
                <span className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-circle p-2 shadow-sm">🛡️</span>
                    {data.officer.department} Office
                </span>
                
                <div className="ms-auto d-flex align-items-center gap-3">
                    {/* ✅ Fixed the Hover Glitch by switching to onClick */}
                    <div className="position-relative">
                        <div 
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill hover-bg-light border bg-white shadow-sm"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                        >
                            <FaUserTie className="text-primary"/>
                            <span className="fw-bold text-dark">{data.officer.name}</span>
                            <FaCaretDown className="text-muted"/>
                        </div>
                        
                        {showDropdown && (
                            <div className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3 overflow-hidden border" style={{minWidth: '180px', zIndex: 1000}}>
                                <button onClick={handleLogout} className="btn w-100 text-start px-3 py-3 text-danger bg-transparent border-0 hover-bg-light d-flex align-items-center fw-bold">
                                    <FaSignOutAlt className="me-2"/> Logout
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

                {/* Queue Card */}
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
                                            {isIdOfficer && <th>ID Card</th>}
                                            <th>Date</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.queue.map(student => (
                                            <tr key={student.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{student.student_name}</div>
                                                    {!!student.bypass_requested && (
                                                        <span className="badge bg-warning text-dark mt-1 shadow-sm">
                                                            ⚠️ Bypass Request: {student.bypass_reason}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="fw-bold text-primary">{student.matric_no}</td>
                                                
                                                {isIdOfficer && (
                                                    <td>
                                                        {student.id_card_url ? (
                                                            <button className="btn btn-sm btn-outline-primary rounded-pill fw-bold" onClick={() => setPreviewImage(student.id_card_url)}>
                                                                <FaIdCard className="me-1"/> View ID
                                                            </button>
                                                        ) : <span className="badge bg-danger">No File</span>}
                                                    </td>
                                                )}

                                                <td className="text-muted small fw-medium">{student.date}</td>
                                                <td className="text-end pe-4">
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

            {previewImage && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75" style={{zIndex: 1050, backdropFilter: 'blur(5px)'}} onClick={() => setPreviewImage(null)}>
                    <div className="bg-white p-2 rounded shadow-lg" style={{maxWidth: '500px'}}>
                        <img src={previewImage} alt="ID Card" className="img-fluid rounded" />
                        <div className="text-center mt-2 small text-muted fw-bold">Click anywhere to close</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OfficerDashboard;