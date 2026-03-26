import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '@/api/user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize user from localStorage if available
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }

        // Always try to fetch freshest user data from backend if token exists
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }

        // Heartbeat: Check auth status every 5 seconds to detect suspension/expiry
        const heartbeat = setInterval(() => {
            if (localStorage.getItem('token')) {
                checkAuth();
            }
        }, 30000);

        const handleForceLogout = () => {
            logout();
            // Optional: store a flag to show a message on the login page
            sessionStorage.setItem('logout_reason', 'Your session has expired or your account has been suspended.');
        };

        window.addEventListener('force-logout', handleForceLogout);

        return () => {
            clearInterval(heartbeat);
            window.removeEventListener('force-logout', handleForceLogout);
        };
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await getCurrentUser();
            const storedUserStr = localStorage.getItem('user');

            // Only update state if data has changed to prevent unnecessary re-renders
            if (storedUserStr !== JSON.stringify(userData)) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (err) {
            console.error("Auth check failed", err);
            // If checking auth fails (e.g. expired token), logout
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, token) => {
        localStorage.setItem('token', token);
        // We set the initial minimal user data from the auth response
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Then immediately fetch the full profile to populate all fields
        await checkAuth();
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Using replace: true in navigation is better but we use window.location for clean state
        window.location.href = '/auth';
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
