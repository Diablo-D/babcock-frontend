import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
    // State matching your specific database columns
    const [formData, setFormData] = useState({
        surname: '',
        first_name: '',
        middle_name: '',
        matric_no: '',
        email: '',
        password: '',
        gsm_no: '',
        gender: 'Male',
        academic_department: '',
        course: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/register', formData);
            alert("✅ Account Created! Please Login.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Registration failed. Please check your inputs.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light py-5">
            <div className="card shadow-lg border-0" style={{ maxWidth: '700px', width: '100%' }}>
                <div className="card-body p-5">
                    <h3 className="fw-bold text-primary text-center mb-4">Student Registration</h3>
                    
                    {error && <div className="alert alert-danger small">{error}</div>}

                    <form onSubmit={handleRegister}>
                        
                        {/* --- NAME SECTION --- */}
                        <h6 className="text-muted small fw-bold mb-3 border-bottom pb-2">Basic Information</h6>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label small fw-bold">Surname</label>
                                <input type="text" id="surname" className="form-control" required onChange={handleChange} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label small fw-bold">First Name</label>
                                <input type="text" id="first_name" className="form-control" required onChange={handleChange} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label small fw-bold">Middle Name</label>
                                <input type="text" id="middle_name" className="form-control" onChange={handleChange} />
                            </div>
                        </div>

                        {/* --- CONTACT SECTION --- */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">Gender</label>
                                <select id="gender" className="form-select" onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">GSM Number (Phone)</label>
                                <input type="tel" id="gsm_no" className="form-control" placeholder="080..." required onChange={handleChange} />
                            </div>
                        </div>

                        {/* --- ACADEMIC SECTION --- */}
                        <h6 className="text-muted small fw-bold mb-3 border-bottom pb-2 mt-2">Academic Details</h6>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">Matric Number</label>
                                <input type="text" id="matric_no" className="form-control" placeholder="22/1234" required onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">Department</label>
                                <select id="academic_department" className="form-select" required onChange={handleChange} defaultValue="">
                                    <option value="" disabled>Select...</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Accounting">Accounting</option>
                                    <option value="Mass Communication">Mass Communication</option>
                                </select>
                            </div>
                            <div className="col-md-12 mb-3">
                                <label className="form-label small fw-bold">Course of Study</label>
                                <input type="text" id="course" className="form-control" placeholder="e.g. B.Sc Computer Science" required onChange={handleChange} />
                            </div>
                        </div>

                        {/* --- LOGIN SECTION --- */}
                        <h6 className="text-muted small fw-bold mb-3 border-bottom pb-2 mt-2">Login Credentials</h6>
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <label className="form-label small fw-bold">Email Address</label>
                                <input type="email" id="email" className="form-control" required onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label className="form-label small fw-bold">Password</label>
                                <input type="password" id="password" className="form-control" required onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Creating Profile...' : 'Complete Registration'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <small className="text-muted">Already registered? <Link to="/login" className="fw-bold">Login here</Link></small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;