import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaSearch, FaUserGraduate, FaSync } from 'react-icons/fa';

function AllStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/students');
            setStudents(response.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredStudents = students.filter(student => 
        (student.matric_no && student.matric_no.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container-fluid p-4">   
            <div className="container pt-5">
                
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4 text-white">
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/admin/dashboard" className="btn btn-light rounded-circle shadow-sm" style={{width:'45px', height:'45px', display:'grid', placeItems:'center'}}>
                            <FaArrowLeft className="text-primary"/>
                        </Link>
                        <div>
                            <h2 className="fw-bold mb-0 text-shadow">Student Master List</h2>
                            <p className="mb-0 text-white-50">Database of all registered students</p>
                        </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                        <div className="bg-white rounded-pill shadow-sm px-3 py-2 d-flex align-items-center" style={{width: '300px'}}>
                            <FaSearch className="text-muted me-2" />
                            <input 
                                className="border-0 bg-transparent w-100" 
                                style={{outline: 'none'}}
                                placeholder="Search Name or Matric..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchStudents} className="btn btn-light rounded-circle shadow-sm" style={{width:'45px', height:'45px'}}>
                            <FaSync className={loading ? "fa-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Glass Table Card */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{background: 'rgba(255,255,255,0.95)'}}>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-5 text-center text-muted">
                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                <p>Loading student database...</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="p-5 text-center text-muted">
                                <h5>No Students Found</h5>
                                <p>Try adjusting your search query.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-uppercase small fw-bold text-muted">
                                        <tr>
                                            <th className="ps-4 py-3">Student Identity</th>
                                            <th>Department</th>
                                            <th>Current Stage</th>
                                            <th className="text-end pe-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary" style={{width:'40px', height:'40px'}}>
                                                            <FaUserGraduate />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{student.name}</div>
                                                            <div className="small text-primary fw-bold">{student.matric_no}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{student.academic_dept}</td>
                                                
                                                <td className="fw-bold">
                                                    {/* ✅ FIXED: Added "?." so it doesn't crash if current_location is null */}
                                                    {student.current_location?.includes('Rejected') ? (
                                                        <span className="text-danger">{student.current_location}</span>
                                                    ) : (
                                                        <span className="text-primary">{student.current_location || 'Not Started'}</span>
                                                    )}
                                                </td>

                                                <td className="text-end pe-4">
                                                    <span className={`badge px-3 py-2 rounded-pill ${
                                                        student.status === 'Completed' ? 'bg-success' : 
                                                        (student.status === 'In_Progress' ? 'bg-warning text-dark' : 'bg-secondary')
                                                    }`}>
                                                        {/* ✅ FIXED: Fallback added if status is null */}
                                                        {student.status ? student.status.replace('_', ' ') : 'Not Started'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-center mt-3 text-white-50 small">
                    Showing {filteredStudents.length} record(s)
                </div>
            </div>
        </div>
    );
}

export default AllStudents;