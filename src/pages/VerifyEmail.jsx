import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { FaEnvelope, FaRedo, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const token = location.state?.token || localStorage.getItem('token') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef([]);

    // Store token for API calls
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        }
        if (!email) {
            navigate('/');
        }
    }, [token, email, navigate]);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendCooldown]);

    const handleChange = (idx, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[idx] = value.slice(-1);
        setOtp(next);
        if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) return toast.error('Please enter the full 6-digit code');
        setLoading(true);
        try {
            const res = await api.post('/verify-email', { email, otp: code });
            toast.success(res.data.message);
            setVerified(true);
            // Redirect to login after a moment
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await api.post('/resend-verification', { email });
            toast.success('New code sent!');
            setResendCooldown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not resend');
        }
    };

    const labelStyle = {
        fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
    };

    return (
        <div className="animated-mesh-bg" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-6)',
        }}>
            {/* Top bar */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-6)', zIndex: 10,
            }}>
                <button onClick={() => navigate('/')} className="btn-ghost-glass" style={{ padding: '6px 14px' }}>
                    <FaArrowLeft size={12} /> Back
                </button>
                <ThemeToggle />
            </div>

            {/* Card */}
            <div className="glass-card page-enter" style={{
                maxWidth: 440, width: '100%', padding: 'var(--space-10)',
                textAlign: 'center',
            }}>
                {verified ? (
                    <>
                        <FaCheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 'var(--space-4)' }} />
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Email Verified!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Redirecting you to login...
                        </p>
                    </>
                ) : (
                    <>
                        {/* Icon */}
                        <div style={{
                            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
                            background: 'var(--accent-soft)', color: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-5)',
                        }}>
                            <FaEnvelope size={24} />
                        </div>

                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                            Verify Your Email
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', lineHeight: 1.6 }}>
                            We sent a 6-digit code to
                        </p>
                        <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
                            {email}
                        </p>

                        {/* OTP Inputs */}
                        <div style={{
                            display: 'flex', gap: 'var(--space-2)', justifyContent: 'center',
                            marginBottom: 'var(--space-6)',
                        }} onPaste={handlePaste}>
                            {otp.map((digit, idx) => (
                                <input key={idx} ref={el => inputRefs.current[idx] = el}
                                    type="text" inputMode="numeric" maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(idx, e.target.value)}
                                    onKeyDown={e => handleKeyDown(idx, e)}
                                    style={{
                                        width: 52, height: 60, textAlign: 'center',
                                        fontSize: 'var(--text-xl)', fontWeight: 700,
                                        borderRadius: 'var(--radius-md)',
                                        border: `2px solid ${digit ? 'var(--accent)' : 'var(--border-default)'}`,
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: 'all var(--duration-normal) var(--ease-out)',
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => { if (!digit) e.target.style.borderColor = 'var(--border-default)'; }}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6}
                            className="btn-primary-glass" style={{
                                width: '100%', padding: 'var(--space-3) var(--space-6)',
                                fontSize: 'var(--text-base)', marginBottom: 'var(--space-5)',
                            }}>
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        {/* Resend */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                            <span style={labelStyle}>Didn't receive it?</span>
                            {resendCooldown > 0 ? (
                                <span style={{ ...labelStyle, color: 'var(--text-muted)' }}>
                                    Resend in {resendCooldown}s
                                </span>
                            ) : (
                                <button onClick={handleResend} style={{
                                    background: 'none', border: 'none', color: 'var(--accent)',
                                    fontWeight: 600, fontSize: 'var(--text-xs)', cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontFamily: 'var(--font-sans)',
                                }}>
                                    <FaRedo size={10} /> Resend Code
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
