import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login as loginApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input, Button } from '../ui';

import './AuthForm.css';

const LoginForm = ({ onToggle }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const validate = () => {
        if (!formData.identifier.trim()) {
            toast.error('Email or Username is required');
            return false;
        }
        if (!formData.password) {
            toast.error('Password is required');
            return false;
        }
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        // Clear any old, potentially invalid logout reasons
        sessionStorage.removeItem('logout_reason');

        setLoading(true);
        try {
            const data = await loginApi(formData.identifier, formData.password);
            await login(data, data.token);
            toast.success('Welcome back!');
            const target = location.state?.from?.pathname || (data.role === 'ROLE_ADMIN' ? '/admin/users' : '/dashboard');
            navigate(target, { replace: true });
        } catch (err) {
            // Check if errors are field-specific from backend
            if (err.response?.status === 400 && typeof err.response.data === 'object') {
                const backendErrors = err.response.data;
                // If it's a map of field errors, show them in toasts
                if (backendErrors.usernameOrEmail) {
                    toast.error(backendErrors.usernameOrEmail);
                } else if (backendErrors.password) {
                    toast.error(backendErrors.password);
                } else if (backendErrors.message) {
                    toast.error(backendErrors.message);
                } else {
                    toast.error('Invalid credentials. Please try again.');
                }
            } else {
                const msg = err.response?.data?.message || 'Invalid email or password';
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <Input
                label="Email or Username"
                name="identifier"
                placeholder="Type your email address or your username"
                value={formData.identifier}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                autoComplete="username"
            />

            <div className="input-container" style={{ marginBottom: '1rem' }}>
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                    <Link to="/forgot-password" title="Forgot password?" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                        Forgot password?
                    </Link>
                </div>
                <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Type your password"
                    value={formData.password}
                    onChange={handleChange}
                    leftIcon={<Lock size={18} />}
                    autoComplete="current-password"
                    style={{ marginBottom: 0 }}
                    rightIcon={
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                />
            </div>

            <p className="terms-text" style={{ fontSize: '0.8125rem', color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                By clicking Log in, you accept Kuizu's <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</a>
            </p>

            <Button type="submit" isLoading={loading} className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
            </Button>

            <Button variant="ghost" className="w-full mt-4" onClick={onToggle} disabled={loading}>
                New to Kuizu? Create an account
            </Button>
        </form>
    );
};

export default LoginForm;
