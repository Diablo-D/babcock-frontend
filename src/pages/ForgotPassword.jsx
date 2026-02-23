import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [data, setData] = useState({ email: '', otp: '', newPassword: '' });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!data.email) return setError('Please enter your email.');

        setLoading(true);
        try {
            await api.post('/forgot-password', { email: data.email });
            setSuccess('OTP sent! Please check your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!data.otp || !data.newPassword) return setError('Please fill all fields.');

        setLoading(true);
        try {
            await api.post('/reset-password', { 
                email: data.email, 
                otp: data.otp, 
                password: data.newPassword 
            });
            alert('Password reset successful! Redirecting to login...');
            navigate('/register'); // Or wherever your login page is
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-bg d-flex align-items-center justify-content-center position-relative" style={{ minHeight: '100vh' }}>
            
            <div className="glass-back-circle" style={{top: '30px', left: '30px', zIndex: 200}} onClick={() => navigate(-1)} title="Go Back">
                <FaArrowLeft />
            </div>

            <div className="container-glass p-5 text-center bg-white bg-opacity-75" style={{ maxWidth: '500px', width: '90%', minHeight: 'auto' }}>
                
                {step === 1 ? (
                    <form onSubmit={handleSendOtp} noValidate>
                        <h2 className="fw-bold mb-3 text-dark">Reset Password</h2>
                        <p className="text-muted small mb-4">Enter your registered email address (School or Personal) to receive a 6-digit recovery code.</p>
                        
                        {error && <div className="alert border-0 shadow-sm py-2 mb-3 w-100 small text-start rounded-3" style={{backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', fontWeight: '500'}}>{error}</div>}

                        <input type="email" className="glass-input mb-4" placeholder="Enter your email" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
                        
                        <button className="glass-btn w-100 py-3 fw-bold" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} noValidate>
                        <h2 className="fw-bold mb-3 text-dark">Enter OTP</h2>
                        <p className="text-muted small mb-4">We sent a 6-digit code to <strong>{data.email}</strong>.</p>
                        
                        {error && <div className="alert border-0 shadow-sm py-2 mb-3 w-100 small text-start rounded-3" style={{backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', fontWeight: '500'}}>{error}</div>}
                        {success && <div className="alert border-0 shadow-sm py-2 mb-3 w-100 small text-start rounded-3" style={{backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754', fontWeight: '500'}}>{success}</div>}

                        <input type="text" className="glass-input mb-3 text-center fw-bold fs-5" placeholder="6-Digit OTP" maxLength="6" style={{letterSpacing: '5px'}} value={data.otp} onChange={e => setData({...data, otp: e.target.value})} />
                        <input type="password" className="glass-input mb-4" placeholder="Enter New Password (Min 6 chars)" value={data.newPassword} onChange={e => setData({...data, newPassword: e.target.value})} />
                        
                        <button className="glass-btn w-100 py-3 fw-bold mb-3" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        
                        <span style={{cursor: 'pointer'}} className="text-muted small fw-bold" onClick={() => { setStep(1); setError(''); setSuccess(''); }}>
                            ← Back to Email
                        </span>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;