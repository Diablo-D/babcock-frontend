import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';

export default function VerifyCertificate() {
    const { token } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/certificate/verify/${token}`)
            .then(res => setResult({ ok: true, ...res.data }))
            .catch(() => setResult({ ok: false }))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ color: '#fff', fontSize: 18 }}>Verifying certificate...</div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
            <div style={{
                background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 480,
                width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
                borderTop: `6px solid ${result?.ok ? '#10b981' : '#ef4444'}`,
                textAlign: 'center',
            }}>
                <div style={{ marginBottom: 24 }}>
                    {result?.ok
                        ? <FaCheckCircle size={56} style={{ color: '#10b981' }} />
                        : <FaTimesCircle size={56} style={{ color: '#ef4444' }} />
                    }
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                    {result?.ok ? 'Certificate Verified ✓' : 'Certificate Not Found'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>
                    {result?.ok
                        ? 'This is an authentic Babcock University Clearance Certificate.'
                        : 'This QR code does not match any certificate in our system.'}
                </p>

                {result?.ok && (
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <FaShieldAlt style={{ color: '#C8940A' }} />
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>Certificate Details</span>
                        </div>
                        {[
                            ['Student Name', result.student_name],
                            ['Matric Number', result.matric_no],
                            ['Programme', result.course],
                            ['School / Faculty', result.school],
                            ['Certificate No.', result.certificate_no],
                            ['Date of Issue', result.issued_at],
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <p style={{ marginTop: 24, fontSize: 11, color: '#94a3b8' }}>
                    Babcock University Clearance System · {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
