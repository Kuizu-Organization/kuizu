import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Info, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input, Button } from '../ui';

import './AuthForm.css';

const RegisterForm = ({ onToggle }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        bio: '',
        role: 'ROLE_STUDENT'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const validate = () => {
        // Username validation
        if (!formData.username.trim()) {
            toast.error('Username is required');
            return false;
        } else if (formData.username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return false;
        } else if (formData.username.length > 50) {
            toast.error('Username must be at most 50 characters');
            return false;
        } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
            toast.error('Username can only contain letters, numbers, dots, underscores, and hyphens');
            return false;
        } else if (/^\d+$/.test(formData.username)) {
            toast.error('Username cannot be only numbers');
            return false;
        }

        // Email validation
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (!formData.password) {
            toast.error('Password is required');
            return false;
        } else {
            if (formData.password.length < 8) {
                toast.error('Password must be at least 8 characters');
                return false;
            } else if (!/[A-Z]/.test(formData.password)) {
                toast.error('Password must contain at least one uppercase letter');
                return false;
            } else if (!/[a-z]/.test(formData.password)) {
                toast.error('Password must contain at least one lowercase letter');
                return false;
            } else if (!/\d/.test(formData.password)) {
                toast.error('Password must contain at least one number');
                return false;
            } else if (!/[@#$%^&+=!]/.test(formData.password)) {
                toast.error('Password must contain at least one special character (@#$%^&+=!)');
                return false;
            }
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }

        if (formData.displayName && formData.displayName.length > 150) {
            toast.error('Display name must be at most 150 characters');
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

        // Clear any old, potentially invalid logout reasons
        sessionStorage.removeItem('logout_reason');

        // Clear any old, potentially invalid logout reasons
        sessionStorage.removeItem('logout_reason');

        setLoading(true);
        try {
            const data = await registerApi(formData);
            if (data.requireOtp) {
                toast.success('Registration successful. Please verify your email.');
                navigate(`/forgot-password?email=${encodeURIComponent(formData.email)}&action=register`);
            } else {
                await login(data, data.token);
                toast.success('Account created successfully!');
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response?.status === 400 && typeof err.response.data === 'object') {
                const backendErrors = err.response.data;
                const errorFields = Object.keys(backendErrors);
                if (errorFields.length > 0 && !backendErrors.message) {
                    toast.error(backendErrors[errorFields[0]]);
                } else {
                    toast.error(backendErrors.message || 'Registration failed');
                }
            } else {
                const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <Input
                label="Username"
                name="username"
                placeholder="Choose a username (3-50 chars)"
                value={formData.username}
                onChange={handleChange}
                leftIcon={<UserIcon size={18} />}
                autoComplete="username"
            />

            <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Type your email address"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                autoComplete="email"
            />

            <div className="input-container" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>I am a...</label>
                <div className="role-selection-wrapper" style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        type="button"
                        variant={formData.role === 'ROLE_STUDENT' ? 'primary' : 'secondary'}
                        className="role-selection-btn"
                        style={{ flex: 1 }}
                        onClick={() => setFormData({ ...formData, role: 'ROLE_STUDENT' })}
                    >
                        Student
                    </Button>
                    <Button
                        type="button"
                        variant={formData.role === 'ROLE_TEACHER' ? 'primary' : 'secondary'}
                        className="role-selection-btn"
                        style={{ flex: 1 }}
                        onClick={() => setFormData({ ...formData, role: 'ROLE_TEACHER' })}
                    >
                        Teacher
                    </Button>
                </div>
            </div>

            <Input
                label="Display Name (Optional)"
                name="displayName"
                placeholder="Your public name (max 150 chars)"
                value={formData.displayName}
                onChange={handleChange}
                leftIcon={<Info size={18} />}
            />

            <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Secure password (8+ chars)"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock size={18} />}
                autoComplete="new-password"
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

            <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<Lock size={18} />}
                autoComplete="new-password"
                rightIcon={
                    <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                }
            />

            <p className="terms-text" style={{ fontSize: '0.8125rem', color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                By clicking Sign up, you accept Kuizu's <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</a>
            </p>

            <Button type="submit" isLoading={loading} className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
            </Button>

            <Button variant="ghost" className="w-full mt-4" onClick={onToggle} disabled={loading}>
                Already have an account? Log in
            </Button>
        </form>
    );
};

export default RegisterForm;
