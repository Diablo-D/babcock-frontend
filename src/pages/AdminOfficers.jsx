import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AdminOfficers() {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', department: '' });

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/officers');
            setOfficers(response.data);
        } catch (error) {
            console.error("Error fetching officers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOfficer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/officers', formData);
            setShowModal(false); // Close modal
            setFormData({ name: '', email: '', department: '' }); // Reset form
            fetchOfficers(); // Refresh table
        } catch (error) {
            alert("Error adding officer. Check console for details.");
        }
    };

    useEffect(() => {
        fetchOfficers();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Department Officers</h2>
                    <p className="text-muted">Manage the staff responsible for clearing students.</p>
                </div>
                <button className="btn btn-primary px-4 shadow-sm" onClick={() => setShowModal(true)}>
                    + Add New Officer
                </button>
            </div>

            {/* The Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Officer Name</th>
                                <th>Department</th>
                                <th>Email Address</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {officers.length > 0 ? (
                                officers.map((officer) => (
                                    <tr key={officer.id}>
                                        <td className="ps-4 fw-semibold">{officer.name}</td>
                                        <td><span className="badge bg-info-subtle text-info border border-info-subtle">{officer.department}</span></td>
                                        <td>{officer.email}</td>
                                        <td><span className="badge bg-success">Active</span></td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-light border me-2 text-primary">Edit</button>
                                            <button className="btn btn-sm btn-outline-danger">Remove</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        {loading ? "Loading officers..." : "No officers found. Add the first one to get started!"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bootstrap-style Modal (Manual Implementation for speed) */}
            {showModal && (
                <div className="modal d-block show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add New Officer</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddOfficer}>
                                <div className="modal-body py-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">FULL NAME</label>
                                        <input type="text" className="form-control" placeholder="Dr. John Doe" 
                                               value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">DEPARTMENT</label>
                                        <select className="form-select" value={formData.department} 
                                                onChange={(e) => setFormData({...formData, department: e.target.value})} required>
                                            <option value="">Select Department</option>
                                            <option value="Library">Library</option>
                                            <option value="Bursary">Bursary</option>
                                            <option value="Registry">Registry</option>
                                            <option value="Security">Security</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">EMAIL ADDRESS</label>
                                        <input type="email" className="form-control" placeholder="officer@babcock.edu.ng" 
                                               value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Create Officer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOfficers;