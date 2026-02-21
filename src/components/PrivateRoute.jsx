import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');

    // 1. Not Logged In? -> Go to Login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // 2. Wrong Role? -> Go to Login (or unauthorized page)
    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/login" />;
    }

    // 3. Allowed! -> Render the page
    return children;
};

export default PrivateRoute;