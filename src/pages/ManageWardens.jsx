import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUserPlus, FaTrash, FaEdit, FaTimes, FaUserShield } from 'react-icons/fa';

function ManageWardens() {
    const [wardens, setWardens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const fetchWardens = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/wardens');
            setWardens(res.data);
        } catch (err) { toast.error('Failed to load wardens'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchWardens(); }, [fetchWardens]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/wardens/${editingId}`, form);
                toast.success('Warden updated');
            } else {
                await api.post('/admin/wardens', form);
                toast.success('Warden created');
            }
            resetForm();
            fetchWardens();
        } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this warden?')) return;
        try {
            await api.delete(`/admin/wardens/${id}`);
            toast.success('Warden deleted');
            fetchWardens();
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleEdit = (w) => {
        setEditingId(w.id);
        setForm({ name: w.name, email: w.email, password: '' });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: '', email: '', password: '' });
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
                            Manage Wardens
                        </h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        {wardens.length} registered warden{wardens.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary-glass">
                    <FaUserPlus size={14} /> Add Warden
                </button>
            </div>

            {/* Wardens Table */}
            {loading ? (
                <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
            ) : (
                <div className="glass-table-wrap">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-6)' }}>Warden Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wardens.map(w => (
                                <tr key={w.id}>
                                    <td style={{ paddingLeft: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--text-xs)', fontWeight: 700,
                                            }}>
                                                <FaUserShield size={13} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{w.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{w.email}</td>
                                    <td>
                                        <span className={`badge-glass ${w.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                                            {w.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(w)} className="btn-icon-glass" title="Edit">
                                                <FaEdit size={13} />
                                            </button>
                                            <button onClick={() => handleDelete(w.id)} className="btn-icon-glass" title="Delete"
                                                style={{ color: 'var(--danger)' }}>
                                                <FaTrash size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {wardens.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                                        No wardens registered yet.
                                    </td>
                                </tr>
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
                                {editingId ? 'Edit Warden' : 'Add New Warden'}
                            </h3>
                            <button onClick={resetForm} className="btn-icon-glass" style={{ width: 32, height: 32 }}>
                                <FaTimes size={12} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input className="glass-input" placeholder="Warden name" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={labelStyle}>Email</label>
                                <input className="glass-input" type="email" placeholder="warden@babcock.edu.ng" value={form.email}
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

export default ManageWardens;
