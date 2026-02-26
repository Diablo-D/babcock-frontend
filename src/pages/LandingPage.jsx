import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { FaArrowRight, FaShieldAlt, FaBolt, FaCloudUploadAlt, FaChevronDown, FaUserGraduate, FaCheckCircle, FaLock } from 'react-icons/fa';

function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [creds, setCreds] = useState({ identifier: '', password: '' });
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (location.state?.email) {
            setCreds(prev => ({ ...prev, identifier: location.state.email }));
        }
    }, [location.state]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!creds.identifier || !creds.password) {
            setLoginError('Please fill in all fields to login.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/login', creds);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_role', res.data.user.role);
            localStorage.setItem('user_name', res.data.user.name);
            const role = res.data.user.role;
            if (role === 'student') navigate('/student/dashboard');
            else if (role === 'officer') navigate('/officer/dashboard');
            else if (role === 'super_admin') navigate('/admin/dashboard');
        } catch (err) {
            // Handle unverified email
            if (err.response?.status === 403 && err.response?.data?.email_not_verified) {
                localStorage.setItem('token', err.response.data.token);
                navigate('/verify-email', { state: { email: err.response.data.email, token: err.response.data.token } });
                return;
            }
            // Handle blocked account
            if (err.response?.status === 403 && err.response?.data?.account_blocked) {
                const reason = err.response.data.block_reason;
                setLoginError(`Your account has been blocked.${reason ? ' Reason: ' + reason : ''}`);
                return;
            }
            setLoginError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* ══════════ HERO SECTION ══════════ */}
            <section className="hero-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Nav */}
                <nav style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'var(--space-4) var(--space-8)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, color: '#fff', fontSize: 'var(--text-lg)',
                        }}>B</div>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: '#fff', letterSpacing: '-0.02em' }}>
                            BUCS Portal
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <ThemeToggle />
                    </div>
                </nav>

                {/* Hero Content */}
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 'var(--space-8)', maxWidth: 1200, margin: '0 auto', width: '100%',
                    gap: 'var(--space-16)',
                    flexWrap: 'wrap',
                }}>
                    {/* Left — Text */}
                    <div style={{ flex: '1 1 420px', maxWidth: 560, position: 'relative' }}>
                        {/* GIMMICK: Glowing moving orb behind text */}
                        <div className="glowing-orb" style={{ top: '-20%', left: '-10%' }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'var(--gold-300)', fontSize: 'var(--text-xs)', fontWeight: 600,
                                marginBottom: 'var(--space-6)', letterSpacing: '0.04em',
                            }}>
                                <FaBolt size={10} color="var(--gold-400)" /> PREMIUM DIGITAL CLEARANCE
                            </p>

                            <h1 style={{
                                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800,
                                lineHeight: 1.1, color: '#fff', marginBottom: 'var(--space-6)',
                                letterSpacing: '-0.03em',
                            }}>
                                Clearance Made<br />
                                <span className="text-shimmer-gold">Effortless.</span>
                            </h1>

                            <p style={{
                                fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.85)',
                                lineHeight: 1.7, marginBottom: 'var(--space-8)', maxWidth: 440,
                            }}>
                                The official Babcock University clearance platform. Process your graduation clearance digitally — no queues, no paperwork.
                            </p>

                            {/* Feature Pills */}
                            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                {[
                                    { icon: <FaUserGraduate size={13} />, text: 'For Students' },
                                    { icon: <FaLock size={13} />, text: 'Secure' },
                                    { icon: <FaCheckCircle size={13} />, text: 'Real-Time' },
                                ].map((pill, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '8px 16px', borderRadius: 'var(--radius-full)',
                                        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
                                        fontSize: 'var(--text-xs)', fontWeight: 500,
                                    }}>
                                        {pill.icon} {pill.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Login Card */}
                    <div style={{ flex: '1 1 380px', maxWidth: 420 }}>
                        <div className="glass-panel-strong" style={{
                            padding: 'var(--space-8)',
                            background: 'var(--glass-bg-strong)',
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Welcome Back
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                                    Sign in to your dashboard
                                </p>
                            </div>

                            <form onSubmit={handleLogin} noValidate>
                                {loginError && (
                                    <div className="alert-glass alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                                        {loginError}
                                    </div>
                                )}

                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Email or Matric No
                                    </label>
                                    <input
                                        className="glass-input"
                                        placeholder="e.g. 22/1234 or email@babcock.edu.ng"
                                        value={creds.identifier}
                                        onChange={e => setCreds({ ...creds, identifier: e.target.value })}
                                    />
                                </div>

                                <div style={{ marginBottom: 'var(--space-3)' }}>
                                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="glass-input"
                                        placeholder="Enter password"
                                        value={creds.password}
                                        onChange={e => setCreds({ ...creds, password: e.target.value })}
                                    />
                                </div>

                                <div style={{ textAlign: 'right', marginBottom: 'var(--space-5)' }}>
                                    <span
                                        onClick={() => navigate('/forgot-password')}
                                        style={{
                                            fontSize: 'var(--text-xs)', fontWeight: 600,
                                            color: 'var(--accent)', cursor: 'pointer',
                                        }}
                                    >
                                        Forgot Password?
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary-glass"
                                    style={{ width: '100%', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' }}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'} <FaArrowRight size={14} />
                                </button>
                            </form>

                            <div style={{
                                textAlign: 'center', marginTop: 'var(--space-6)',
                                paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-default)',
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                                    New student?
                                </p>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn-ghost-glass"
                                    style={{ fontSize: 'var(--text-sm)' }}
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{
                    textAlign: 'center', paddingBottom: 'var(--space-8)',
                    animation: 'float 2s ease-in-out infinite',
                }}>
                    <FaChevronDown size={20} color="rgba(255,255,255,0.4)" />
                </div>
            </section>

            {/* ══════════ ABOUT BUCS SECTION ══════════ */}
            <section className="animated-mesh-bg" style={{ padding: 'var(--space-20) var(--space-6)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
                        <p style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            background: 'var(--accent-soft)', color: 'var(--accent)',
                            fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.04em',
                            marginBottom: 'var(--space-4)',
                        }}>
                            ABOUT THE SYSTEM
                        </p>
                        <h2 style={{
                            fontSize: 'var(--text-3xl)', fontWeight: 800,
                            color: 'var(--text-primary)', marginBottom: 'var(--space-4)',
                            letterSpacing: '-0.02em',
                        }}>
                            What is BUCS?
                        </h2>
                        <p style={{
                            fontSize: 'var(--text-lg)', color: 'var(--text-secondary)',
                            maxWidth: 600, margin: '0 auto', lineHeight: 1.7,
                        }}>
                            The Babcock University Clearance System digitizes the entire graduation clearance process — from ID verification to final department sign-off.
                        </p>
                    </div>

                    {/* How It Works — 3 Steps */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 'var(--space-6)', marginBottom: 'var(--space-16)',
                    }}>
                        {[
                            {
                                step: '01',
                                title: 'Register & Upload ID',
                                desc: 'Create your student account and upload a valid ID card for verification by the ID Card Unit.',
                                icon: <FaCloudUploadAlt size={24} />,
                            },
                            {
                                step: '02',
                                title: 'Auto-Route to Departments',
                                desc: 'The system automatically queues you at each department — Library, Bursary, BUTH, Bookshop, Estate, and more.',
                                icon: <FaBolt size={24} />,
                            },
                            {
                                step: '03',
                                title: 'Get Cleared Digitally',
                                desc: 'Each department reviews and approves your clearance. Track real-time progress from your dashboard.',
                                icon: <FaCheckCircle size={24} />,
                            },
                        ].map((item, i) => (
                            <div key={i} className="glass-card hover-lift" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                                    background: 'var(--accent-soft)', color: 'var(--accent)',
                                    marginBottom: 'var(--space-5)',
                                }}>
                                    {item.icon}
                                </div>
                                <p style={{
                                    fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--highlight)',
                                    letterSpacing: '0.1em', marginBottom: 'var(--space-2)',
                                }}>
                                    STEP {item.step}
                                </p>
                                <h4 style={{
                                    fontSize: 'var(--text-lg)', fontWeight: 700,
                                    color: 'var(--text-primary)', marginBottom: 'var(--space-3)',
                                }}>
                                    {item.title}
                                </h4>
                                <p style={{
                                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                                    lineHeight: 1.6,
                                }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Feature Grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 'var(--space-4)',
                    }}>
                        {[
                            { icon: <FaLock />, title: 'End-to-End Secure', desc: 'Encrypted data, token-based auth, role-based access.' },
                            { icon: <FaBolt />, title: 'Real-Time Updates', desc: 'See your clearance status update live as officers act.' },
                            { icon: <FaShieldAlt />, title: 'Privacy Protected', desc: 'Sensitive info only visible to authorized departments.' },
                            { icon: <FaUserGraduate />, title: 'Student-First Design', desc: 'Built for ease of use — no technical skills needed.' },
                        ].map((feat, i) => (
                            <div key={i} className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                    background: 'var(--highlight-soft)', color: 'var(--highlight)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {feat.icon}
                                </div>
                                <div>
                                    <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                        {feat.title}
                                    </h5>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center', marginTop: 'var(--space-16)',
                        paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border-default)',
                    }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            © {new Date().getFullYear()} Babcock University Clearance System. All rights reserved.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;