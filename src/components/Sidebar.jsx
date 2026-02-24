import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="bg-dark text-white vh-100 p-3 shadow" style={{ width: '260px', position: 'fixed', top: 0, left: 0 }}>
            <div className="text-center mb-4 mt-2">
                <h4 className="text-primary fw-bold">BUCS Admin</h4>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Babcock University</small>
            </div>
            <hr className="border-secondary" />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-2">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active bg-primary" : "nav-link text-white"}>
                        📊 Dashboard
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/admin/officers" className={({ isActive }) => isActive ? "nav-link active bg-primary" : "nav-link text-white"}>
                        👨‍💼 Manage Officers
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;