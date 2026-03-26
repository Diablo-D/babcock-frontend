import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaGraduationCap, FaSearch, FaSync, FaExclamationCircle } from 'react-icons/fa';

function AdminAlumni() {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAlumni = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/alumni');
            setAlumni(response.data);
        } catch (error) {
            console.error('Error fetching alumni:', error);
            toast.error('Failed to load alumni records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlumni();
    }, [fetchAlumni]);

    const filteredAlumni = alumni.filter(a => {
        const search = searchTerm.toLowerCase();
        return (
            (a.student_name || '').toLowerCase().includes(search) ||
            (a.matric_no || '').toLowerCase().includes(search) ||
            (a.certificate_no || '').toLowerCase().includes(search) ||
            (a.department || '').toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <div className="page-container page-enter">
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <div className="skeleton" style={{ width: '30%', height: 40, borderRadius: 8 }}></div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 12 }}></div>
            </div>
        );
    }

    return (
        <div className="page-container page-enter">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaGraduationCap size={18} />
                        </div>
                        Alumni Directory
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginLeft: 44 }}>
                        View all students who have successfully completed their overall clearance and received their official certificates.
                    </p>
                </div>
                <button onClick={fetchAlumni} className="btn-ghost-glass">
                    <FaSync size={14} /> Refresh
                </button>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                    <FaSearch size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, matric no, or certificate no..."
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: 40 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    Showing <strong>{filteredAlumni.length}</strong> record{filteredAlumni.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Table */}
            <div className="glass-table-wrap">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 'var(--space-6)' }}>Student Record</th>
                            <th>Certificate Details</th>
                            <th>Department</th>
                            <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Issued Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlumni.length > 0 ? (
                            filteredAlumni.map((student) => (
                                <tr key={student.id} className="hover-highlight">
                                    <td style={{ paddingLeft: 'var(--space-6)' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.student_name}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{student.matric_no}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>{student.certificate_no}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Verified Clearance</div>
                                    </td>
                                    <td>
                                        <div className="badge-glass" style={{ color: 'var(--text-secondary)' }}>
                                            {student.department}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                                        {student.issued_date}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                                    <FaExclamationCircle size={24} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No alumni records found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminAlumni;
