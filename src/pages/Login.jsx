import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Scroll to the login section when clicking "Begin Clearance"
    const scrollToLogin = () => {
        document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // FIXED: Changed 'email' to 'identifier' to match the backend validation
            const response = await api.post('/login', { 
                identifier: email, 
                password 
            });
            
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user_role', user.role);
            localStorage.setItem('user_name', user.name);

            switch(user.role) {
                case 'admin': navigate('/admin/dashboard'); break;
                case 'officer': navigate('/admin/officers'); break;
                case 'student': navigate('/student/dashboard'); break;
                default: setError("Unknown role. Please contact support.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.response && err.response.status === 401) {
                setError("Invalid credentials. Please check your email or password.");
            } else {
                setError("System error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            
            {/* 1. NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
                <div className="container">
                    <span className="navbar-brand fw-bold d-flex align-items-center">
                        <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '30px', height: '30px'}}>B</span>
                        BUCS Portal
                    </span>
                    <div className="ms-auto">
                        <button onClick={scrollToLogin} className="btn btn-outline-light btn-sm px-4">Login</button>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <header className="bg-white text-dark py-5 border-bottom">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold text-primary mb-3">Babcock University Clearance System.</h1>
                            <p className="lead text-muted mb-4">
                                Experience a seamless, digital clearance process. No more queues, no more paperwork. 
                                Secure, fast, and accessible from anywhere.
                            </p>
                            <button onClick={scrollToLogin} className="btn btn-primary btn-lg px-5 shadow-sm rounded-pill">
                                Begin Clearance &rarr;
                            </button>
                        </div>
                        <div className="col-lg-6 text-center mt-4 mt-lg-0">
                            {/* Placeholder for a nice hero image or illustration */}
                            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center text-muted border border-dashed" style={{height: '300px', width: '100%'}}>
                                🖼️ [Hero Image Placeholder]
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. FEATURES SECTION */}
            <section className="py-5 bg-light">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold">Why use the Digital Portal?</h2>
                        <p className="text-muted">Building an effective information management system for you.</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm hover-shadow transition-all text-center p-4">
                                <div className="text-primary display-6 mb-3">📊</div>
                                <h5 className="fw-bold">Personalized Dashboard</h5>
                                <p className="text-muted small">Track your clearance status in real-time across all departments from one view.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm hover-shadow transition-all text-center p-4">
                                <div className="text-primary display-6 mb-3">🔔</div>
                                <h5 className="fw-bold">Instant Notifications</h5>
                                <p className="text-muted small">Get email alerts the moment an officer approves or rejects your request.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm hover-shadow transition-all text-center p-4">
                                <div className="text-primary display-6 mb-3">📜</div>
                                <h5 className="fw-bold">Printable Certificate</h5>
                                <p className="text-muted small">Download your official clearance certificate instantly upon completion.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. LOGIN SECTION (The "Portal") */}
            <section id="login-section" className="py-5 bg-white border-top">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-8">
                            <div className="text-center mb-4">
                                <small className="text-uppercase text-muted fw-bold ls-1">e-Clearance</small>
                                <h2 className="fw-bold mb-3">Login Portal</h2>
                                <p className="text-muted">Enter your details to access your dashboard.</p>
                            </div>

                            <div className="card border-0 shadow-lg overflow-hidden">
                                <div className="card-body p-5">
                                    {error && <div className="alert alert-danger text-center small py-2">{error}</div>}
                                    
                                    <form onSubmit={handleLogin}>
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="emailInput" 
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required 
                                            />
                                            <label htmlFor="emailInput">Email Address / Matric No.</label>
                                        </div>
                                        <div className="form-floating mb-4">
                                            <input 
                                                type="password" 
                                                className="form-control" 
                                                id="passwordInput" 
                                                placeholder="Password" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="passwordInput">Password</label>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm" disabled={loading}>
                                            {loading ? 'Authenticating...' : 'Sign In to Portal'}
                                        </button>
                                    </form>
                                    
                                    <div className="text-center mt-4 pt-3 border-top">
                                        <p className="small text-muted mb-0">Don't have an account?</p>
                                        <button className="btn btn-link btn-sm text-decoration-none fw-bold">Register as Student</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-dark text-white py-4 mt-auto">
                <div className="container text-center">
                    <small className="text-white-50">&copy; 2026 Babcock University. All rights reserved.</small>
                </div>
            </footer>
        </div>
    );
}

export default Login;