import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaUserGraduate, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

function LandingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [creds, setCreds] = useState({ identifier: '', password: '' });
    
    // NEW: State for login errors
    const [loginError, setLoginError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(''); // Clear previous errors

        // NEW: Check for empty fields manually
        if (!creds.identifier || !creds.password) {
            setLoginError('⚠️ Please fill in all fields to login.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/login', creds);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_role', res.data.user.role);
            localStorage.setItem('user_name', res.data.user.name);
            
            const role = res.data.user.role;
            if(role === 'student') navigate('/student/dashboard');
            else if(role === 'officer') navigate('/officer/dashboard');
            else if(role === 'super_admin') navigate('/admin/dashboard');
        } catch (err) {
            // NEW: Show backend errors in the UI instead of an alert
            setLoginError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-bg">
            <nav className="navbar navbar-expand-lg py-3 px-4">
                <span className="navbar-brand fw-bold fs-4 text-white d-flex align-items-center gap-2">
                    <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow" style={{width: '40px', height: '40px'}}>B</span>
                    BUCS Portal
                </span>
            </nav>

            <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="row w-100 align-items-center g-5">
                    
                    {/* LEFT: INFO */}
                    <div className="col-lg-7 text-white">
                        <h1 className="display-3 fw-bold mb-4" style={{textShadow: '0 4px 15px rgba(0,0,0,0.3)'}}>
                            Clearance Made <br/>
                            <span className="text-warning">Digital.</span>
                        </h1>
                        <p className="lead mb-5 fs-5" style={{textShadow: '0 2px 5px rgba(0,0,0,0.3)'}}>
                            Skip the queues. The official Babcock University clearance platform allows you to process your graduation clearance from anywhere.
                        </p>
                        
                        <div className="d-flex gap-3">
                            <div className="glass-card p-3 px-4 d-flex align-items-center gap-3 text-dark">
                                <FaUserGraduate className="fs-2 text-primary" />
                                <div><div className="fw-bold">Student</div><small className="text-muted">Portal</small></div>
                            </div>
                            <div className="glass-card p-3 px-4 d-flex align-items-center gap-3 text-dark">
                                <FaShieldAlt className="fs-2 text-primary" />
                                <div><div className="fw-bold">Secure</div><small className="text-muted">System</small></div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: LOGIN FORM */}
                    <div className="col-lg-5">
                        <div className="glass-card p-5">
                            <div className="text-center mb-4">
                                <h3 className="fw-bold text-primary">Welcome Back</h3>
                                <p className="text-muted small">Login to access your dashboard</p>
                            </div>
                            
                            {/* ADDED noValidate to stop browser popups */}
                            <form onSubmit={handleLogin} noValidate>
                                
                                {/* NEW: IN-PAGE ERROR NOTIFICATION */}
                                {loginError && (
                                    <div className="alert border-0 shadow-sm py-2 mb-3 small text-start rounded-3" style={{backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', fontWeight: '500'}}>
                                        {loginError}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <input className="glass-input" placeholder="Matric No (e.g. 22/1234)" onChange={e => setCreds({...creds, identifier: e.target.value})} />
                                </div>
                                <div className="mb-4">
                                    <input type="password" className="glass-input" placeholder="Password" onChange={e => setCreds({...creds, password: e.target.value})} />
                                </div>
                                <button className="glass-btn-primary w-100 py-3" disabled={loading}>
                                    {loading ? 'Authenticating...' : 'Login to Portal'} <FaArrowRight />
                                </button>
                            </form>

                            <div className="text-center mt-4 pt-3 border-top border-light">
                                <small className="text-muted">First time here?</small><br/>
                                <button onClick={() => navigate('/register')} className="btn btn-link fw-bold text-decoration-none">Create Student Account</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;