import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

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
                    <button onClick={() => window.history.back()}>✕</button>
                </div>
                <div className="auth-card">
                    <div className="auth-tabs">
                        <button
                            className={!isLogin ? 'active' : ''}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign up
                        </button>
                        <button
                            className={isLogin ? 'active' : ''}
                            onClick={() => setIsLogin(true)}
                        >
                            Log in
                        </button>
                    </div>

                    <div className="auth-social">
                        <button className="google-btn">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                            <span>{isLogin ? 'Log in with Google' : 'Sign up with Google'}</span>
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>or email</span>
                    </div>

                    {isLogin ? (
                        <LoginForm onToggle={() => setIsLogin(false)} />
                    ) : (
                        <RegisterForm onToggle={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
