import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaUsers, FaHourglassHalf, FaCheckCircle, FaUserTie, FaSync } from 'react-icons/fa';

function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/dashboard');
            setData(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center text-white">Loading System Overview...</div>;

    const { stats, bottlenecks } = data;

    // Helper for Stat Cards
    const StatCard = ({ title, count, icon, color, link, linkText }) => (
        <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-lg rounded-4 h-100 p-3" style={{background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <p className="text-muted small text-uppercase fw-bold mb-1">{title}</p>
                            <h2 className="display-5 fw-bold text-dark mb-0">{count}</h2>
                        </div>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white bg-${color} shadow-sm`} style={{width: '50px', height: '50px', fontSize: '1.2rem'}}>
                            {icon}
                        </div>
                    </div>
                    {link && (
                        <Link to={link} className={`text-decoration-none small fw-bold text-${color} mt-auto`}>
                            {linkText} &rarr;
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5 text-white">
                <div style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    <h2 className="fw-bold mb-1">System Overview</h2>
                    <p className="mb-0 text-white-75">Welcome back, Admin. Here is what's happening today.</p>
                </div>
                <button onClick={fetchDashboard} className="btn btn-light rounded-pill shadow-sm fw-bold text-primary px-4">
                    <FaSync className="me-2" /> Refresh Data
                </button>
            </div>

            {/* Stat Cards Row */}
            <div className="row g-4 mb-5">
                <StatCard title="Total Students" count={stats.total_students} icon={<FaUsers/>} color="primary" link="/admin/students" linkText="View Full List" />
                <StatCard title="Active Clearances" count={stats.active_clearances} icon={<FaHourglassHalf/>} color="warning" />
                <StatCard title="Cleared Students" count={stats.cleared_students} icon={<FaCheckCircle/>} color="success" />
                <StatCard title="Staff / Officers" count={stats.staff_count} icon={<FaUserTie/>} color="info" link="/admin/officers" linkText="Manage Staff" />
            </div>

            {/* Bottlenecks Table */}
            <h4 className="fw-bold text-white mb-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Department Traffic (Bottlenecks) 🚦</h4>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{background: 'rgba(255, 255, 255, 0.90)', backdropFilter: 'blur(15px)'}}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-uppercase small fw-bold text-muted">
                                <tr>
                                    <th className="ps-4 py-3">Department</th>
                                    <th>Students Waiting</th>
                                    <th className="text-end pe-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bottlenecks.map(dept => (
                                    <tr key={dept.id}>
                                        <td className="ps-4 fw-bold text-dark py-3">{dept.name}</td>
                                        <td>
                                            {dept.count > 0 ? (
                                                <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm">{dept.count} Waiting</span>
                                            ) : (
                                                <span className="badge bg-light text-muted border rounded-pill px-3 py-2">All Clear</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <Link 
                                                to={`/admin/queue/${encodeURIComponent(dept.name)}`} 
                                                className={`btn btn-sm rounded-pill px-4 fw-bold shadow-sm ${dept.count > 0 ? 'btn-primary' : 'btn-outline-secondary disabled'}`}
                                            >
                                                {dept.count > 0 ? 'View Queue →' : 'Empty Queue'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;