import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    // Debug log
    console.log("ProtectedRoute check. User:", user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
