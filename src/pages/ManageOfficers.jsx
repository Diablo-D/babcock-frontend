import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaUserPlus, FaUserTie, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

function ManageOfficers() {
    const [officers, setOfficers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // NEW: Track if we are editing an existing officer
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [offRes, deptRes] = await Promise.all([
                api.get('/admin/officers'),
                api.get('/admin/departments')
            ]);
            setOfficers(offRes.data);
            setDepartments(deptRes.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLE SUBMIT (CREATE OR UPDATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing officer
                await api.put(`/admin/officers/${editingId}`, formData);
                alert("Officer Updated Successfully!");
            } else {
                // Create new officer
                await api.post('/admin/officers', formData);
                alert("Officer Created Successfully!");
            }
            resetForm();
            fetchData(); 
        } catch (err) {
            alert(err.response?.data?.message || "Action Failed.");
        }
    };

    // --- HANDLE DELETE ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this officer? This cannot be undone.")) return;
        
        try {
            await api.delete(`/admin/officers/${id}`);
            alert("Officer Removed!");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete.");
        }
    };

    // --- POPULATE FORM FOR EDITING ---
    const handleEditClick = (officer) => {
        setEditingId(officer.id);
        setFormData({
            name: officer.name,
            email: officer.email,
            department_id: officer.department_id || '',
            password: '' // Leave blank so we don't accidentally overwrite it
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', password: '', department_id: '' });
    };

    return (
        <div className="container-fluid p-5">
            {/* Header */}
            <div className="d-flex align-items-center mb-5 gap-3 text-white">
                <Link to="/admin/dashboard" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)'}}>
                    <FaArrowLeft className="text-primary" />
                </Link>
                <div style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <FaUserTie /> Manage Officers
                    </h2>
                    <p className="mb-0 text-white-75">Assign and update staff to their respective departments.</p>
                </div>
            </div>

            <div className="row g-4">
                {/* LEFT: ADD/EDIT OFFICER FORM */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{background: 'rgba(255, 255, 255, 0.90)', backdropFilter: 'blur(15px)'}}>
                        
                        {/* Dynamic Form Header */}
                        <div className={`p-3 fw-bold d-flex align-items-center justify-content-between text-white ${editingId ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            <div className="d-flex align-items-center gap-2">
                                {editingId ? <FaEdit /> : <FaUserPlus />} 
                                {editingId ? 'Edit Officer' : 'Add New Officer'}
                            </div>
                            {editingId && (
                                <button onClick={resetForm} className="btn btn-sm btn-outline-dark border-0 rounded-circle">
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Full Name</label>
                                    <input className="form-control bg-light border-0" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Assign Department</label>
                                    <select className="form-select bg-light border-0" required value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
                                        <option value="">Select Department...</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Email Address</label>
                                    <input type="email" className="form-control bg-light border-0" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">
                                        Password {editingId && <span className="text-warning small">(Leave blank to keep current)</span>}
                                    </label>
                                    <input type="password" className="form-control bg-light border-0" required={!editingId} minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                                
                                <button type="submit" className={`btn w-100 rounded-pill py-2 fw-bold shadow-sm ${editingId ? 'btn-warning text-dark' : 'btn-primary'}`} disabled={loading}>
                                    {editingId ? 'Save Changes' : 'Create Officer'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT: OFFICERS LIST */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100" style={{background: 'rgba(255, 255, 255, 0.90)', backdropFilter: 'blur(15px)'}}>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-5 text-center text-muted">Loading officers...</div>
                            ) : (
                                <div className="table-responsive" style={{maxHeight: '600px'}}>
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light text-uppercase small fw-bold text-muted sticky-top">
                                            <tr>
                                                <th className="ps-4 py-3">Officer Name</th>
                                                <th>Assigned Department</th>
                                                <th>Email</th>
                                                <th className="text-end pe-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {officers.map(officer => (
                                                <tr key={officer.id}>
                                                    <td className="ps-4 fw-bold text-dark py-3">{officer.name}</td>
                                                    <td><span className="badge bg-info text-dark rounded-pill px-3 shadow-sm">{officer.department?.name || 'Unassigned'}</span></td>
                                                    <td className="text-muted">{officer.email}</td>
                                                    
                                                    {/* NEW ACTION BUTTONS */}
                                                    <td className="text-end pe-4">
                                                        <button 
                                                            onClick={() => handleEditClick(officer)} 
                                                            className="btn btn-sm btn-outline-primary rounded-circle me-2 shadow-sm"
                                                            title="Edit Officer"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(officer.id)} 
                                                            className="btn btn-sm btn-outline-danger rounded-circle shadow-sm"
                                                            title="Remove Officer"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ManageOfficers;