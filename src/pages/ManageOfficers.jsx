import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUserPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

function ManageOfficers() {
    const [officers, setOfficers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', department_id: '', email: '', password: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [oRes, dRes] = await Promise.all([api.get('/admin/officers'), api.get('/admin/departments')]);
            setOfficers(oRes.data);
            setDepartments(dRes.data);
        } catch (err) { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/officers/${editingId}`, form);
                toast.success('Officer updated');
            } else {
                await api.post('/admin/officers', form);
                toast.success('Officer created');
            }
            resetForm();
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this officer?')) return;
        try {
            await api.delete(`/admin/officers/${id}`);
            toast.success('Officer deleted');
            fetchData();
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleEdit = (officer) => {
        setEditingId(officer.id);
        setForm({ name: officer.name, department_id: officer.department_id || '', email: officer.email, password: '' });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: '', department_id: '', email: '', password: '' });
        setShowModal(false);
    };

    const labelStyle = {
        display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.05em',
    };

    return (
        <div className="page-container page-enter">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                        <Link to="/admin/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <FaArrowLeft size={14} />
                        </Link>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Manage Officers
                        </h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        {officers.length} registered officer{officers.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary-glass">
                    <FaUserPlus size={14} /> Add Officer
                </button>
            </div>

            {/* Officers Table */}
            {loading ? (
                <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
            ) : (
                <div className="glass-table-wrap">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-6)' }}>Officer Name</th>
                                <th>Department</th>
                                <th>Email</th>
                                <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {officers.map(o => (
                                <tr key={o.id}>
                                    <td style={{ paddingLeft: 'var(--space-6)', fontWeight: 600 }}>{o.name}</td>
                                    <td>
                                        <span className="badge-glass badge-highlight">
                                            {o.department?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{o.email}</td>
                                    <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(o)} className="btn-icon-glass" title="Edit">
                                                <FaEdit size={13} />
                                            </button>
                                            <button onClick={() => handleDelete(o.id)} className="btn-icon-glass" title="Delete"
                                                style={{ color: 'var(--danger)' }}>
                                                <FaTrash size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {officers.length === 0 && (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                                    No officers registered yet.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="glass-modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
                    <div className="glass-modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {editingId ? 'Edit Officer' : 'Add New Officer'}
                            </h3>
                            <button onClick={resetForm} className="btn-icon-glass" style={{ width: 32, height: 32 }}>
                                <FaTimes size={12} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input className="glass-input" placeholder="Officer name" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={labelStyle}>Department</label>
                                <select className="glass-select" value={form.department_id}
                                    onChange={e => setForm({ ...form, department_id: e.target.value })}>
                                    <option value="">Select department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={labelStyle}>Email</label>
                                <input className="glass-input" type="email" placeholder="officer@babcock.edu.ng" value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <label style={labelStyle}>{editingId ? 'New Password (leave blank to keep)' : 'Password'}</label>
                                <input className="glass-input" type="password" placeholder="Min 8 characters" value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <button type="button" onClick={resetForm} className="btn-ghost-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-glass" style={{ flex: 1, padding: 'var(--space-3)' }}>
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageOfficers;