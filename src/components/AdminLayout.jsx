import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaUserTie, FaSignOutAlt } from 'react-icons/fa';

function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navLinks = [
        { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/admin/officers', icon: <FaUserTie />, label: 'Manage Officers' },
        { path: '/admin/students', icon: <FaUsers />, label: 'All Students' },
    ];

    return (
        <>
          
            <div className="animated-fluid-bg">
                {/* --- GLASS SIDEBAR --- */}
                <div className="d-flex flex-column flex-shrink-0 p-4 text-white shadow-lg" style={{
                    width: '260px',
                    background: 'rgba(15, 23, 42, 0.45)', // Dark translucent
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 10
                }}>
                    <div className="d-flex align-items-center mb-4 gap-2">
                        <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow" style={{width: '35px', height: '35px', fontWeight: 'bold'}}>B</span>
                        <span className="fs-5 fw-bold text-white" style={{letterSpacing: '1px'}}>BUCS Admin</span>
                    </div>
                    
                    <hr className="border-light opacity-25 mb-4" />
                    
                    <ul className="nav nav-pills flex-column mb-auto gap-2">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <li className="nav-item" key={link.path}>
                                    <Link 
                                        to={link.path} 
                                        className={`nav-link d-flex align-items-center gap-3 py-3 px-3 rounded-4 transition-all ${isActive ? 'bg-primary text-white shadow' : 'text-white-50 hover-bg-glass'}`}
                                        style={{ transition: 'all 0.4s ease', background: isActive ? '' : 'rgba(255,255,255,0.05)' }}
                                    >
                                        <span className={isActive ? "text-white" : "text-white-50"}>{link.icon}</span> 
                                        <span className="fw-medium">{link.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    
                    <hr className="border-light opacity-25 mt-auto mb-4" />
                    
                    <button onClick={handleLogout} className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 border-0 transition-all hover-shadow" style={{background: 'rgba(255,255,255,0.1)'}}>
                        <FaSignOutAlt /> Log Out
                    </button>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-grow-1 overflow-auto" style={{ height: '100vh', position: 'relative' }}>
                    {children}
                </div>
            </div>
        </>
    );
}

export default AdminLayout;