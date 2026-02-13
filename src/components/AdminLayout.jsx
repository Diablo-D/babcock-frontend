import React from 'react';
import Sidebar from './Sidebar';

function AdminLayout({ children }) {
    return (
        <div className="d-flex bg-light min-vh-100">
            <Sidebar />
            <main className="flex-grow-1" style={{ marginLeft: '260px', padding: '40px' }}>
                <div className="container-fluid">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;