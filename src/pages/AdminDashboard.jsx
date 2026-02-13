import React, { useEffect, useState } from 'react';
import api from '../services/api';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchStats = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error("Dashboard Error:", err);
            if (loading) setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
            if (isManual) setTimeout(() => setRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchStats();
        const intervalId = setInterval(() => fetchStats(false), 60000); // 1 minute auto-refresh
        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div className="p-5 text-center text-muted">Loading Dashboard...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    const { summary, bottlenecks } = stats;

    return (
        <div className="container-fluid p-4">
            {/* --- HEADER SECTION --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">System Overview</h2>
                    <p className="text-muted mb-0">Welcome back, MR BLACK. Here is what's happening today....</p>
                </div>
                
                <div className="d-flex align-items-center gap-3">
                    {/* NEW: Sleek White Pill Button */}
                    <button 
                        onClick={() => fetchStats(true)} 
                        className="btn btn-white bg-white border shadow-sm rounded-pill px-4 py-2 fw-bold text-primary d-flex align-items-center gap-2"
                        style={{ fontSize: '0.85rem' }}
                        disabled={refreshing}
                    >
                        <span className={refreshing ? "spinner-border spinner-border-sm" : ""}>
                            {!refreshing && "↻"}
                        </span>
                        {refreshing ? "Syncing..." : "Refresh Data"}
                    </button>

                    <div className="text-end">
                         <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill">
                            ● Live
                        </span>
                        <div className="text-muted small mt-1" style={{fontSize: '0.7rem'}}>
                            Updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 1. STATUS CARDS (With Icons) --- */}
            <div className="row g-4 mb-5">
                {/* Total Students */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
                        <div className="card-body position-relative z-1">
                            <h6 className="text-muted text-uppercase mb-2 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Total Students</h6>
                            <h2 className="display-5 fw-bold text-primary mb-0">{summary.total_students}</h2>
                        </div>
                        {/* Faded Background Icon */}
                        <div className="position-absolute text-primary opacity-10" style={{top: '10px', right: '-10px', fontSize: '5rem'}}>
                            👥
                        </div>
                    </div>
                </div>

                {/* Active Clearances */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden border-start border-warning border-4">
                        <div className="card-body position-relative z-1">
                            <h6 className="text-muted text-uppercase mb-2 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Active Clearances</h6>
                            <h2 className="display-5 fw-bold text-dark mb-0">{summary.active_clearances}</h2>
                        </div>
                        <div className="position-absolute text-warning opacity-25" style={{top: '10px', right: '-10px', fontSize: '5rem'}}>
                            ⏳
                        </div>
                    </div>
                </div>

                {/* Completed */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden border-start border-success border-4">
                        <div className="card-body position-relative z-1">
                            <h6 className="text-muted text-uppercase mb-2 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Cleared Students</h6>
                            <h2 className="display-5 fw-bold text-success mb-0">{summary.completed_clearances}</h2>
                        </div>
                        <div className="position-absolute text-success opacity-25" style={{top: '10px', right: '-10px', fontSize: '5rem'}}>
                            ✅
                        </div>
                    </div>
                </div>

                {/* Officers */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
                        <div className="card-body position-relative z-1">
                            <h6 className="text-muted text-uppercase mb-2 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Staff / Officers</h6>
                            <h2 className="display-5 fw-bold text-secondary mb-0">{summary.total_officers}</h2>
                        </div>
                        <div className="position-absolute text-secondary opacity-10" style={{top: '10px', right: '-10px', fontSize: '5rem'}}>
                            👔
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. BOTTLENECK TABLE --- */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-0">
                    <h5 className="mb-0 fw-bold">Department Traffic (Bottlenecks) 🚦</h5>
                    <small className="text-muted">Real-time queue status across all units.</small>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4 py-3">Department</th>
                                    <th>Students Waiting</th>
                                    <th>Officer Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bottlenecks.map((dept, index) => {
                                    const isClean = dept.students_stuck === 0;
                                    return (
                                        <tr key={index}>
                                            <td className="ps-4 fw-bold text-dark">{dept.department}</td>
                                            <td>
                                                {isClean ? (
                                                    <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">
                                                        All Clear
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                                                        {dept.students_stuck} Waiting
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-muted small">
                                                {dept.officer_assigned}
                                            </td>
                                            <td>
                                                {/* SMART BUTTON LOGIC */}
                                                <button 
                                                    className={`btn btn-sm px-3 rounded-pill ${isClean ? 'btn-light text-muted disabled border-0' : 'btn-outline-primary'}`}
                                                    disabled={isClean}
                                                >
                                                    {isClean ? 'Empty Queue' : 'View Queue →'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;