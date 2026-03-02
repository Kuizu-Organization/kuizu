import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import { Button, Tabs } from '../components/ui';
import './AuthPage.css';

const AuthPage = () => {
    const { user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

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

                    <div className="auth-social">
                        <Button variant="outline" className="w-full google-btn">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />
                            <span>{isLogin ? 'Log in with Google' : 'Sign up with Google'}</span>
                        </Button>
                    </div>

                    {/* Content is handled by Tabs now, but since we had conditional rendering before, we keep it consistent.
                        Actually, the Tabs component already handles the switching. 
                        Wait, the LoginForm/RegisterForm had their own state toggle.
                        Let's just use the Tabs for a cleaner look.
                    */}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
