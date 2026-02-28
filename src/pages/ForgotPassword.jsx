import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { FaArrowLeft, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState({ email: '', otp: '', newPassword: '' });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!data.email) return setError('Please enter your email.');
        setLoading(true);
        try {
            await api.post('/forgot-password', { email: data.email });
            toast.success('OTP sent! Check your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!data.otp || !data.newPassword) return setError('Please fill all fields.');
        if (data.newPassword.length < 8) return setError('Password must be at least 8 characters.');
        setLoading(true);
        try {
            await api.post('/reset-password', { email: data.email, otp: data.otp, password: data.newPassword });
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally { setLoading(false); }
    };

    const labelStyle = {
        display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.05em',
    };

    return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-8)' }}>
                <button onClick={() => navigate('/')} className="btn-icon-glass">
                    <FaArrowLeft size={14} />
                </button>
                <ThemeToggle />
            </nav>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <div className="glass-panel-strong page-enter" style={{ maxWidth: 440, width: '100%', padding: 'var(--space-8)' }}>

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} noValidate>
                            {/* Icon */}
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                                    background: 'var(--accent-soft)', color: 'var(--accent)',
                                    marginBottom: 'var(--space-4)',
                                }}>
                                    <FaEnvelope size={22} />
                                </div>
                                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Reset Password
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                                    Enter your email to receive a recovery code
                                </p>
                            </div>

                            {error && <div className="alert-glass alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

                            <div style={{ marginBottom: 'var(--space-5)' }}>
                                <label style={labelStyle}>Email Address</label>
                                <input className="glass-input" type="email" placeholder="your@email.com" value={data.email}
                                    onChange={e => setData({ ...data, email: e.target.value })} />
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary-glass"
                                style={{ width: '100%', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' }}>
                                {loading ? 'Sending...' : 'Send OTP Code'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
                                <span onClick={() => navigate('/')} style={{ color: 'var(--accent)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
                                    ← Back to Sign In
                                </span>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} noValidate>
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                                    background: 'var(--success-soft)', color: 'var(--success)',
                                    marginBottom: 'var(--space-4)',
                                }}>
                                    <FaKey size={22} />
                                </div>
                                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Enter OTP
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                                    We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{data.email}</strong>
                                </p>
                            </div>

                            {error && <div className="alert-glass alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={labelStyle}>6-digit OTP</label>
                                <input className="glass-input" placeholder="000000" maxLength={6}
                                    style={{ textAlign: 'center', fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '0.5em' }}
                                    value={data.otp} onChange={e => setData({ ...data, otp: e.target.value })} />
                            </div>

                            <div style={{ marginBottom: 'var(--space-5)' }}>
                                <label style={labelStyle}>New Password (Min 8 chars)</label>
                                <input className="glass-input" type="password" placeholder="Create a new password"
                                    value={data.newPassword} onChange={e => setData({ ...data, newPassword: e.target.value })} />
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary-glass"
                                style={{ width: '100%', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>

                            <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-ghost-glass"
                                style={{ width: '100%', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-sm)' }}>
                                ← Back to Email
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;