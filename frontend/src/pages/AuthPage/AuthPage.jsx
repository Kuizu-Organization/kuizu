import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Tabs } from '@/components/ui';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '@/api/auth';
import './AuthPage.css';

const AuthPage = () => {
    const { user, login } = useAuth();
    const toast = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isSocialLoading, setIsSocialLoading] = useState(false);
    const [hasCheckedReason, setHasCheckedReason] = useState(false);

    useEffect(() => {
        if (!hasCheckedReason) {
            const reason = sessionStorage.getItem('logout_reason');
            if (reason) {
                toast.error(reason);
                sessionStorage.removeItem('logout_reason');
            }
            setHasCheckedReason(true);
        }
    }, [hasCheckedReason, toast]);

    const hasShownToast = React.useRef(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const reason = queryParams.get('reason');

        if (reason === 'suspended' && !hasShownToast.current) {
            hasShownToast.current = true;
            toast.error('Your account has been suspended by an administrator. Please contact support.', 10000);
            // Clear the query parameter so it doesn't show again on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location, toast]);

    if (user) {
        const from = location.state?.from?.pathname || (user.role === 'ROLE_ADMIN' ? '/admin/users' : '/dashboard');
        return <Navigate to={from} replace />;
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSocialLoading(true);
        // Clear any old logout reasons so they don't appear as error toasts on success
        sessionStorage.removeItem('logout_reason');
        try {
            const { credential } = credentialResponse;
            const data = await googleLogin(credential);

            // Map backend response to AuthContext login
            const userData = {
                userId: data.userId,
                username: data.username,
                email: data.email,
                role: data.role
            };

            await login(userData, data.token);
            toast.success('Successfully logged in with Google!');
            const target = location.state?.from?.pathname || (data.role === 'ROLE_ADMIN' ? '/admin/users' : '/dashboard');
            navigate(target, { replace: true });
        } catch (error) {
            console.error('Google login error:', error);
            toast.error(error.response?.data?.message || 'Google login failed. Please try again.');
        } finally {
            setIsSocialLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed. Please try again.');
    };

    const authTabs = [
        {
            label: 'Sign up',
            content: <RegisterForm onToggle={() => setIsLogin(true)} />
        },
        {
            label: 'Log in',
            content: <LoginForm onToggle={() => setIsLogin(false)} />
        }
    ];

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="hero-content">
                    <h1>Study effectively and comfortably.</h1>
                </div>
                <div className="brand-logo">Kuizu</div>
            </div>
            <div className="auth-right">
                <div className="auth-close">
                    <button className="close-btn" onClick={() => window.history.back()}>
                        <X size={24} />
                    </button>
                </div>
                <div className="auth-card">
                    <Tabs
                        tabs={authTabs}
                        activeIndex={isLogin ? 1 : 0}
                        onTabChange={(index) => setIsLogin(index === 1)}
                    />

                    <div className="auth-divider">
                        <span>or social</span>
                    </div>

                    <div className="auth-social" style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            width="350"
                            text={isLogin ? 'signin_with' : 'signup_with'}
                            shape="rectangular"
                        />
                        {/* Content is handled by Tabs now, but since we had conditional rendering before, we keep it consistent.
                        Actually, the Tabs component already handles the switching. 
                        Wait, the LoginForm/RegisterForm had their own state toggle.
                        Let's just use the Tabs for a cleaner look.
                    */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
