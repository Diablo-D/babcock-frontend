import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

// 🎓 THE OFFICIAL BABCOCK ACADEMIC STRUCTURE
const academicStructure = {
    "School of Computing": {
        departments: ["Computer Science", "Information Technology", "Software Engineering"],
        courses: ["B.Sc. (Hons.) Computer Science", "B.Sc. (Hons.) Cybersecurity", "B.Sc. (Hons.) Information Systems", "B.Sc. (Hons.) Information Technology", "B.Sc. (Hons.) Software Engineering"]
    },
    "School of Education & Humanities": {
        departments: ["Education", "History & International Studies", "Languages & Literary Studies", "Music & Creative Arts", "Religious Studies"],
        courses: ["B.A. (Hons.) Christian Religious Studies", "B.A. (Hons.) Christian Theology", "B.A. (Hons.) English Studies", "B.A. (Hons.) French and Foreign Studies", "B.A. (Hons.) French Studies", "B.A. (Hons.) History & International Studies", "B.A. (Hons.) Music", "B.A.Ed. (Hons.) English Education", "B.Ed. (Hons.) Educational Management", "B.Sc.Ed. (Hons.) Business Education", "B.Sc.Ed. (Hons.) Economics Education", "B.Sc.Ed. (Hons.) Guidance and Counselling"]
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
        courses: ["B.Sc. (Hons.) Accounting", "B.Sc. (Hons.) Business Administration", "B.Sc. (Hons.) Finance", "B.Sc. (Hons.) Information Resources Management", "B.Sc. (Hons.) Marketing"]
    },
    "School of Science & Technology": {
        departments: ["Agriculture & Industrial Technology", "Basic Sciences", "Microbiology"],
        courses: ["B.Agric. (Hons.) Agriculture", "B.Sc. (Hons.) Biology", "B.Sc. (Hons.) Chemistry", "B.Sc. (Hons.) Mathematics", "B.Sc. (Hons.) Microbiology", "B.Sc. (Hons.) Physics with Electronics"]
    },
    "Veronica Adeleke School of Social Sciences": {
        departments: ["Economics", "Mass Communication", "Political Science and Public Administration", "Social Work"],
        courses: ["B.Sc. (Hons.) Economics", "B.Sc. (Hons.) Mass Communication", "B.Sc. (Hons.) Peace Studies and Conflict Resolution", "B.Sc. (Hons.) Political Science", "B.Sc. (Hons.) Public Administration", "B.Sc. (Hons.) Social Work"]
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

function RegisterPage() {
    const navigate = useNavigate();
    
    const [isSignUp, setIsSignUp] = useState(true); 
    const [loading, setLoading] = useState(false);

    // Notification States
    const [loginError, setLoginError] = useState('');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    const countryCodes = [
        { code: '+234', label: '🇳🇬 NG' },
        { code: '+233', label: '🇬🇭 GH' },
        { code: '+44',  label: '🇬🇧 UK' },
        { code: '+1',   label: '🇺🇸 US' },
        { code: '+1',   label: '🇨🇦 CA' },
        { code: '+27',  label: '🇿🇦 ZA' },
        { code: '+254', label: '🇰🇪 KE' },
    ];

    const [loginCreds, setLoginCreds] = useState({ identifier: '', password: '' });
    
    const [regData, setRegData] = useState({
        surname: '', first_name: '', middle_name: '',
        matric_no: '', email: '', personal_email: '', password: '',
        phone_code: '+234', phone_number: '', 
        gender: 'Male', 
        school: '', 
        academic_department: '', 
        course: ''
    });

    // --- SMART SCHOOL SELECTION ---
    const handleSchoolChange = (e) => {
        const selectedSchool = e.target.value;
        // Reset department and course when school changes to prevent mismatched data
        setRegData({ ...regData, school: selectedSchool, academic_department: '', course: '' });
    };

    // --- 1. HANDLE REGISTER ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        
        // Strict Validation
        if (!regData.surname || !regData.first_name || !regData.email || !regData.personal_email || !regData.matric_no || !regData.phone_number || !regData.academic_department || !regData.course || !regData.password) {
            setRegError("⚠️ Please fill in all required fields, including School, Department, and Course.");
            return;
        }

        const matricRegex = /^(\d{2})\/(\d{4})$/;
        const match = regData.matric_no.match(matricRegex);

        if (!match) {
            setRegError("⚠️ Invalid Matric Number! Must be format: 22/1234");
            return;
        }

        setLoading(true);
        try {
            const fullPayload = {
                ...regData,
                gsm_no: `${regData.phone_code}${regData.phone_number}`
            };

            await api.post('/register', fullPayload);
            
            setRegSuccess("🎉 Registration Successful! Redirecting to login...");
            setTimeout(() => {
                setIsSignUp(false); 
                setRegSuccess(''); 
            }, 2500);

        } catch (err) {
            setRegError(err.response?.data?.message || "Registration Failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. HANDLE LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!loginCreds.identifier || !loginCreds.password) {
            setLoginError('⚠️ Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/login', loginCreds);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_role', res.data.user.role);
            localStorage.setItem('user_name', res.data.user.name);
            
            const role = res.data.user.role;
            if(role === 'student') navigate('/student/dashboard');
            else if(role === 'officer') navigate('/officer/dashboard');
            else if(role === 'super_admin') navigate('/admin/dashboard');
        } catch (err) {
            setLoginError(err.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-bg d-flex align-items-center justify-content-center position-relative">
            
            <div className="glass-back-circle" style={{top: '30px', left: '30px', zIndex: 200}} onClick={() => navigate('/')} title="Back to Home">
                <FaArrowLeft />
            </div>

            <div className={`container-glass ${isSignUp ? "right-panel-active" : ""}`}>
                
                {/* --- REGISTER FORM --- */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegister} noValidate className="d-flex flex-column align-items-center justify-content-center h-100 px-5 text-center bg-white bg-opacity-75">
                        <h2 className="fw-bold text-primary mb-2">Create Account</h2>
                        <p className="text-muted small mb-3">Join the digital clearance platform</p>
                        
                        {regError && <div className="alert border-0 shadow-sm py-2 mb-3 w-100 small text-start rounded-3" style={{backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', fontWeight: '500'}}>{regError}</div>}
                        {regSuccess && <div className="alert border-0 shadow-sm py-2 mb-3 w-100 small text-start rounded-3" style={{backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754', fontWeight: '500'}}>{regSuccess}</div>}

                        <div className="w-100 text-start overflow-auto px-2 custom-scrollbar" style={{maxHeight: '440px'}}>
                            
                            {/* Row 1: Names */}
                            <div className="row g-2">
                                <div className="col-4"><input className="glass-input" placeholder="Surname" onChange={e => setRegData({...regData, surname: e.target.value})} /></div>
                                <div className="col-4"><input className="glass-input" placeholder="First Name" onChange={e => setRegData({...regData, first_name: e.target.value})} /></div>
                                <div className="col-4"><input className="glass-input" placeholder="Middle (Opt.)" onChange={e => setRegData({...regData, middle_name: e.target.value})} /></div>
                            </div>
                            
                            {/* Row 2: Emails */}
                            <div className="row g-2 mt-1">
                                <div className="col-6"><input className="glass-input" type="email" placeholder="School (@student...)" onChange={e => setRegData({...regData, email: e.target.value})} /></div>
                                <div className="col-6"><input className="glass-input" type="email" placeholder="Personal Email" onChange={e => setRegData({...regData, personal_email: e.target.value})} /></div>
                            </div>
                            
                            {/* Row 3: Matric & Phone */}
                            <div className="row g-2 mt-1">
                                <div className="col-5">
                                    <input className="glass-input" placeholder="Matric (e.g. 22/1234)" onChange={e => setRegData({...regData, matric_no: e.target.value})} />
                                </div>
                                <div className="col-7">
                                    <div className="input-group">
                                        <select 
                                            className="form-select glass-input border-end-0 px-1" 
                                            style={{maxWidth: '85px', borderTopRightRadius: 0, borderBottomRightRadius: 0}}
                                            value={regData.phone_code}
                                            onChange={e => setRegData({...regData, phone_code: e.target.value})}
                                        >
                                            {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                        </select>
                                        <input 
                                            type="tel" 
                                            className="form-control glass-input border-start-0" 
                                            style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                                            placeholder="Phone Number" 
                                            onChange={e => setRegData({...regData, phone_number: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Gender & School */}
                            <div className="row g-2 mt-1">
                                <div className="col-4">
                                    <select className="glass-input" onChange={e => setRegData({...regData, gender: e.target.value})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="col-8">
                                    {/* 🏫 THE SCHOOL DROPDOWN */}
                                    <select className="glass-input fw-bold text-primary" value={regData.school} onChange={handleSchoolChange} required>
                                        <option value="">-- Select Your School --</option>
                                        {Object.keys(academicStructure).map(schoolName => (
                                            <option key={schoolName} value={schoolName}>{schoolName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 5: Dynamic Department & Course */}
                            <div className="row g-2 mt-1">
                                <div className="col-6">
                                    {/* 🏢 THE DEPARTMENT DROPDOWN */}
                                    <select 
                                        className="glass-input" 
                                        value={regData.academic_department} 
                                        onChange={e => setRegData({...regData, academic_department: e.target.value})} 
                                        required
                                        disabled={!regData.school}
                                    >
                                        <option value="">-- Department --</option>
                                        {regData.school && academicStructure[regData.school].departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-6">
                                    {/* 📚 THE PROGRAMME DROPDOWN */}
                                    <select 
                                        className="glass-input text-truncate" 
                                        value={regData.course} 
                                        onChange={e => setRegData({...regData, course: e.target.value})} 
                                        required
                                        disabled={!regData.school}
                                    >
                                        <option value="">-- Programme --</option>
                                        {regData.school && academicStructure[regData.school].courses.map(course => (
                                            <option key={course} value={course}>{course}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 6: Password */}
                            <input className="glass-input mt-2" type="password" placeholder="Password (Min 6 chars)" onChange={e => setRegData({...regData, password: e.target.value})} />
                        </div>

                        <button className="glass-btn mt-3 w-100" disabled={loading}>
                            {loading ? 'Processing...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                {/* --- LOGIN FORM --- */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLogin} noValidate className="d-flex flex-column align-items-center justify-content-center h-100 px-5 text-center bg-white bg-opacity-75">
                        <h1 className="fw-bold mb-3 text-dark">Sign In</h1>
                        <p className="text-muted mb-4">Welcome back to your dashboard</p>
                        
                        {loginError && <div className="alert border-0 shadow-sm py-2 mb-3 w-100 small text-start rounded-3" style={{backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', fontWeight: '500'}}>{loginError}</div>}

                        <input className="glass-input mb-3" placeholder="Email or Matric Number" onChange={e => setLoginCreds({...loginCreds, identifier: e.target.value})} />
                        <input type="password" className="glass-input mb-3" placeholder="Password" onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} />
                        
                        <button className="glass-btn mt-3" disabled={loading}>{loading ? 'Loading...' : 'Sign In'}</button>
                    </form>
                </div>

                {/* --- OVERLAY PANELS --- */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h2 className="fw-bold">Already Registered?</h2>
                            <p className="mb-4">To check your clearance status, please login with your personal info.</p>
                            <button className="glass-btn ghost" onClick={() => setIsSignUp(false)}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h2 className="fw-bold">New Student?</h2>
                            <p className="mb-4">Enter your details and start your digital clearance journey with us.</p>
                            <button className="glass-btn ghost" onClick={() => setIsSignUp(true)}>Register</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default RegisterPage;