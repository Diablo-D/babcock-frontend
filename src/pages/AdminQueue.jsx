import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaCheck, FaTimes, FaSearch, FaUserGraduate, FaSignOutAlt, FaCaretDown } from 'react-icons/fa';

const backgroundImages = [
    "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop')",
    "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')",
    "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop')",
];

function AdminQueue() {
    const { department } = useParams(); 
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [bgImage, setBgImage] = useState(backgroundImages[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState(''); 
    const [notification, setNotification] = useState(null); 
    const [processingId, setProcessingId] = useState(null);

    // Random BG
    useEffect(() => {
        setBgImage(backgroundImages[Math.floor(Math.random() * backgroundImages.length)]);
        fetchQueue();
    }, [department]);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchQueue = async () => {
        try {
            const response = await api.get(`/admin/queue/${encodeURIComponent(department)}`);
            setQueue(response.data);
        } catch (err) {
            console.error("Queue Fetch Error:", err);
            setError("Failed to load queue.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (clearanceId) => {
        setProcessingId(clearanceId);
        try {
            await api.post('/admin/approve-student', { clearance_id: clearanceId });
            setQueue((prev) => prev.filter(s => s.id !== clearanceId));
            setSelectedStudent(null);
            showToast("Approved! ✅", "success");
        } catch (err) {
            showToast("Failed to approve.", "danger");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (clearanceId) => {
        const reason = window.prompt("Enter reason (Min 5 chars):");
        if (!reason || reason.trim().length < 5) return showToast("Reason too short!", "danger");

        setProcessingId(`reject-${clearanceId}`); 
        try {
            await api.post('/admin/reject-student', { clearance_id: clearanceId, reason });
            setQueue((prev) => prev.filter(s => s.id !== clearanceId));
            setSelectedStudent(null);
            showToast("Rejected ❌", "warning");
        } catch (err) {
            showToast("Failed to reject.", "danger");
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredQueue = queue.filter(student => 
        student.matric_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4">
            {/* NOTIFICATION */}
            {notification && (
                <div className={`position-fixed top-0 end-0 m-4 p-3 rounded shadow text-white fw-bold fade show`} 
                     style={{ zIndex: 1055, backgroundColor: notification.type === 'success' ? '#198754' : (notification.type === 'warning' ? '#ffc107' : '#dc3545') }}>
                    {notification.message}
                </div>
            )}

            <div className="container pt-5">
                
                {/* HEADER ROW */}
                <div className="d-flex align-items-center justify-content-between mb-4 text-white">
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/admin/dashboard" className="btn btn-light rounded-circle shadow-sm" style={{width:'45px', height:'45px', display:'grid', placeItems:'center'}}>
                            <FaArrowLeft className="text-primary"/>
                        </Link>
                        <div style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                            <h2 className="fw-bold mb-0">{department} Queue</h2>
                            <p className="mb-0 text-white-50">Admin Control Panel</p>
                        </div>
                    </div>

                    {/* SEARCH & LOGOUT DROPDOWN */}
                    <div className="d-flex gap-3 align-items-center">
                        <div className="bg-white rounded-pill shadow-sm px-3 py-2 d-flex align-items-center" style={{width: '250px'}}>
                            <FaSearch className="text-muted me-2" />
                            <input 
                                className="border-0 bg-transparent w-100" 
                                style={{outline: 'none'}}
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* LOGOUT DROPDOWN */}
                        <div 
                            className="position-relative" 
                            onMouseEnter={() => setShowDropdown(true)}
                            onMouseLeave={() => setShowDropdown(false)}
                            style={{cursor: 'pointer'}}
                        >
                            <div className="bg-white rounded-pill shadow-sm px-3 py-2 d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark small">Admin</span>
                                <FaCaretDown className="text-muted"/>
                            </div>
                            {showDropdown && (
                                <div className="position-absolute end-0 mt-1 bg-white shadow rounded-3 border p-1" style={{minWidth: '120px', zIndex: 1000}}>
                                    <button onClick={handleLogout} className="btn btn-sm btn-danger w-100 d-flex align-items-center justify-content-center gap-2">
                                        <FaSignOutAlt/> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-danger shadow-sm">{error}</div>}

                {/* TABLE CARD */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{background: 'rgba(255,255,255,0.95)'}}>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-5 text-center text-muted">Loading queue...</div>
                        ) : queue.length === 0 ? (
                            <div className="p-5 text-center text-muted">
                                <div className="display-4 mb-3">🎉</div>
                                <h5>All Clear!</h5>
                                <p>No students waiting in this department.</p>
                            </div>
                        ) : filteredQueue.length === 0 ? (
                            <div className="p-5 text-center text-muted">No matches found.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-uppercase small fw-bold text-muted">
                                        <tr>
                                            <th className="ps-4 py-3">Student Name</th>
                                            <th>Matric No</th>
                                            <th>Status</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQueue.map((student) => (
                                            <tr key={student.id}>
                                                <td className="ps-4 fw-bold text-dark">
                                                    {student.student_name}
                                                    {/* The '0' fix: using !! to force boolean */}
                                                    {!!student.bypass_requested && (
                                                        <span className="badge bg-warning text-dark ms-2">⚠️ Bypass</span>
                                                    )}
                                                </td>
                                                <td className="text-primary fw-bold">{student.matric_no}</td>
                                                <td><span className="badge bg-warning text-dark shadow-sm px-2 py-1">{student.status}</span></td>
                                                <td className="text-end pe-4">
                                                    <button 
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2"
                                                    >
                                                        Info
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(student.id)}
                                                        className="btn btn-sm btn-outline-danger rounded-pill px-3 me-2"
                                                        disabled={processingId}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(student.id)}
                                                        className="btn btn-sm btn-success rounded-pill px-3 shadow-sm"
                                                        disabled={processingId}
                                                    >
                                                        {processingId === student.id ? '...' : 'Approve'}
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

            {/* MODAL */}
            {selectedStudent && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75" style={{zIndex: 1050}}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden" style={{width: '450px', animation: 'fadeIn 0.3s'}}>
                        <div className="p-4 text-center bg-light border-bottom">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px', fontSize: '2rem'}}>
                                <FaUserGraduate />
                            </div>
                            <h4 className="fw-bold mb-1">{selectedStudent.student_name}</h4>
                            <p className="text-primary fw-bold mb-0">{selectedStudent.matric_no}</p>
                        </div>
                        <div className="p-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small fw-bold">DEPARTMENT</span>
                                <span className="fw-bold">{department}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted small fw-bold">STATUS</span>
                                <span className="badge bg-warning text-dark">{selectedStudent.status}</span>
                            </div>
                            {!!selectedStudent.bypass_requested && (
                                <div className="alert alert-warning mt-3 mb-0 small border-0">
                                    <strong>Request:</strong> {selectedStudent.bypass_reason}
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-light d-flex justify-content-between">
                            <button className="btn btn-white border rounded-pill px-4" onClick={() => setSelectedStudent(null)}>Close</button>
                            <div>
                                <button onClick={() => handleReject(selectedStudent.id)} className="btn btn-outline-danger rounded-pill px-3 me-2">Reject</button>
                                <button onClick={() => handleApprove(selectedStudent.id)} className="btn btn-success rounded-pill px-3">Approve</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminQueue;