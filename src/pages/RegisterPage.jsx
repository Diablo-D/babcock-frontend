import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Babcock Academic Structure
const academicStructure = {
    "School of Computing": {
        departments: ["Computer Science", "Information Technology", "Software Engineering"],
        courses: ["B.Sc. (Hons.) Computer Science", "B.Sc. (Hons.) Cybersecurity", "B.Sc. (Hons.) Information Systems", "B.Sc. (Hons.) Information Technology", "B.Sc. (Hons.) Software Engineering"]
    },
    "School of Education & Humanities": {
        departments: ["Education", "History & International Studies", "Languages & Literary Studies", "Music & Creative Arts", "Religious Studies"],
        courses: ["B.A. (Hons.) Christian Religious Studies", "B.A. (Hons.) English Studies", "B.A. (Hons.) History & International Studies", "B.A. (Hons.) Music", "B.Ed. (Hons.) Educational Management", "B.Sc.Ed. (Hons.) Business Education"]
    },
    "School of Environmental Sciences": {
        departments: ["Architecture", "Estate Management"],
        courses: ["B.Sc. (Hons.) Architecture", "B.Sc. (Hons.) Estate Management"]
    },
    "School of Engineering": {
        departments: ["Civil Engineering", "Computer Engineering", "Electrical Engineering", "Mechanical Engineering"],
        courses: ["B.Eng. (Hons.) Civil Engineering", "B.Eng. (Hons.) Computer Engineering", "B.Eng. (Hons.) Mechanical Engineering"]
    },
    "School of Law & Security Studies": {
        departments: ["Jurisprudence and Public Law", "International Law and Security Studies", "Private and Commercial Law"],
        courses: ["LL.B. (Hons.) Law"]
    },
    "School of Management Sciences": {
        departments: ["Accounting", "Business Administration & Marketing", "Finance", "Information Resources Management"],
        courses: ["B.Sc. (Hons.) Accounting", "B.Sc. (Hons.) Business Administration", "B.Sc. (Hons.) Finance", "B.Sc. (Hons.) Marketing"]
    },
    "School of Science & Technology": {
        departments: ["Agriculture & Industrial Technology", "Basic Sciences", "Microbiology"],
        courses: ["B.Agric. (Hons.) Agriculture", "B.Sc. (Hons.) Biology", "B.Sc. (Hons.) Chemistry", "B.Sc. (Hons.) Mathematics", "B.Sc. (Hons.) Microbiology", "B.Sc. (Hons.) Physics with Electronics"]
    },
    "Veronica Adeleke School of Social Sciences": {
        departments: ["Economics", "Mass Communication", "Political Science and Public Administration", "Social Work"],
        courses: ["B.Sc. (Hons.) Economics", "B.Sc. (Hons.) Mass Communication", "B.Sc. (Hons.) Political Science", "B.Sc. (Hons.) Public Administration", "B.Sc. (Hons.) Social Work"]
    },
    "School of Allied Health Sciences": {
        departments: ["Medical Laboratory Science", "Human Nutrition & Dietetics", "Public Health"],
        courses: ["B.Sc. (Hons.) Public Health", "B.MLS. (Hons.) Medical Laboratory Science", "B.Sc. (Hons.) Human Nutrition and Dietetics"]
    },
    "School of Basic Clinical Sciences": {
        departments: ["Chemical Pathology", "Haematology and Immunology", "Histopathology", "Medical Microbiology", "Pharmacology and Therapeutics"],
        courses: ["MBBS (Bachelor of Medicine, Bachelor of Surgery)"]
    },
    "School of Basic Medical Sciences": {
        departments: ["Anatomy", "Biochemistry", "Physiology"],
        courses: ["B.Sc. (Hons.) Anatomy", "B.Sc. (Hons.) Biochemistry", "B.Sc. (Hons.) Physiology"]
    },
    "School of Clinical Sciences": {
        departments: ["Community Medicine", "Internal Medicine", "Paediatrics", "Obstetrics and Gynaecology", "Surgery"],
        courses: ["MBBS (Bachelor of Medicine, Bachelor of Surgery)"]
    },
    "School of Nursing Sciences": {
        departments: ["Adult Health", "Community Health", "Maternal and Child Health", "Psychiatry and Mental Health"],
        courses: ["B.NSc. (Hons.) Nursing Science"]
    }
};

const countryCodes = [
    { code: '+234', label: '🇳🇬' },
    { code: '+233', label: '🇬🇭' },
    { code: '+44', label: '🇬🇧' },
    { code: '+1', label: '🇺🇸' },
    { code: '+27', label: '🇿🇦' },
    { code: '+254', label: '🇰🇪' },
];

function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [regError, setRegError] = useState('');
    const [regData, setRegData] = useState({
        surname: '', first_name: '', middle_name: '',
        matric_no: '', email: '', personal_email: '', password: '',
        phone_code: '+234', phone_number: '',
        gender: 'Male', school: '', academic_department: '', course: '',
        expected_graduation_date: ''
    });

    const handleSchoolChange = (e) => {
        setRegData({ ...regData, school: e.target.value, academic_department: '', course: '' });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        if (!regData.surname || !regData.first_name || !regData.email || !regData.personal_email ||
            !regData.matric_no || !regData.phone_number || !regData.academic_department || !regData.course || !regData.password || !regData.expected_graduation_date) {
            setRegError('Please fill in all required fields.');
            return;
        }
        if (!/^(\d{2})\/(\d{4})$/.test(regData.matric_no)) {
            setRegError('Invalid Matric Number. Use format: 22/1234');
            return;
        }
        if (regData.password.length < 8) {
            setRegError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/register', { ...regData, gsm_no: `${regData.phone_code}${regData.phone_number}` });
            toast.success('Check your Babcock email for a verification code!');
            navigate('/verify-email', { state: { email: res.data.email, token: res.data.token } });
        } catch (err) {
            setRegError(err.response?.data?.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    const labelStyle = {
        display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 4,
        textTransform: 'uppercase', letterSpacing: '0.05em',
    };

    return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-8)' }}>
                <button onClick={() => navigate('/')} className="btn-icon-glass">
                    <FaArrowLeft size={14} />
                </button>
                <ThemeToggle />
            </nav>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <div className="glass-panel-strong page-enter" style={{
                    maxWidth: 580, width: '100%', padding: 'var(--space-8)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                            Create Account
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Join the digital clearance platform
                        </p>
                    </div>

                    {regError && <div className="alert-glass alert-error" style={{ marginBottom: 'var(--space-4)' }}>{regError}</div>}

                    <form onSubmit={handleRegister} noValidate>
                        {/* Names */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <label style={labelStyle}>Surname *</label>
                                <input className="glass-input" placeholder="e.g. Ogunlade" value={regData.surname} onChange={e => setRegData({ ...regData, surname: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>First Name *</label>
                                <input className="glass-input" placeholder="e.g. Daniel" value={regData.first_name} onChange={e => setRegData({ ...regData, first_name: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Middle</label>
                                <input className="glass-input" placeholder="Optional" value={regData.middle_name} onChange={e => setRegData({ ...regData, middle_name: e.target.value })} />
                            </div>
                        </div>

                        {/* Emails */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <label style={labelStyle}>School Email *</label>
                                <input className="glass-input" type="email" placeholder="@student.babcock.edu.ng" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Personal Email *</label>
                                <input className="glass-input" type="email" placeholder="you@gmail.com" value={regData.personal_email} onChange={e => setRegData({ ...regData, personal_email: e.target.value })} />
                            </div>
                        </div>

                        {/* Matric & Phone */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <label style={labelStyle}>Matric No *</label>
                                <input className="glass-input" placeholder="e.g. 22/1234" value={regData.matric_no} onChange={e => setRegData({ ...regData, matric_no: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone *</label>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <select className="glass-select" style={{ width: 80, padding: '8px', flexShrink: 0 }} value={regData.phone_code} onChange={e => setRegData({ ...regData, phone_code: e.target.value })}>
                                        {countryCodes.map(c => <option key={c.code + c.label} value={c.code}>{c.label} {c.code}</option>)}
                                    </select>
                                    <input className="glass-input" type="tel" placeholder="8012345678" value={regData.phone_number} onChange={e => setRegData({ ...regData, phone_number: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Gender & School */}
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <label style={labelStyle}>Gender</label>
                                <select className="glass-select" value={regData.gender} onChange={e => setRegData({ ...regData, gender: e.target.value })}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>School *</label>
                                <select className="glass-select" value={regData.school} onChange={handleSchoolChange}>
                                    <option value="">Select your school</option>
                                    {Object.keys(academicStructure).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Department & Programme */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <label style={labelStyle}>Department *</label>
                                <select className="glass-select" value={regData.academic_department} onChange={e => setRegData({ ...regData, academic_department: e.target.value })} disabled={!regData.school}>
                                    <option value="">Select department</option>
                                    {regData.school && academicStructure[regData.school].departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Programme *</label>
                                <select className="glass-select" value={regData.course} onChange={e => setRegData({ ...regData, course: e.target.value })} disabled={!regData.school}>
                                    <option value="">Select programme</option>
                                    {regData.school && academicStructure[regData.school].courses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Graduation Date */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={labelStyle}>Expected Graduation Date *</label>
                            <input className="glass-input" type="month" value={regData.expected_graduation_date}
                                onChange={e => setRegData({ ...regData, expected_graduation_date: e.target.value })} />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={labelStyle}>Password * (Min 8 characters)</label>
                            <input className="glass-input" type="password" placeholder="Create a strong password" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary-glass" style={{ width: '100%', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' }}>
                            {loading ? 'Creating Account...' : 'Create Account'} <FaArrowRight size={14} />
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Already have an account?{' '}
                            <span onClick={() => navigate('/')} style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                                Sign In
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;