import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');

    // 1. Not Logged In? -> Go to Landing
    if (!token) {
        return <Navigate to="/" />;
    }

    // 2. Wrong Role? -> Go to Landing
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    // 3. Allowed! -> Render the page
    return children;
};

export default PrivateRoute;