import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../ui';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loader fullPage={true} size="lg" />;
    }

    if (!user) {
        // Store the attempted URL to redirect back after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
