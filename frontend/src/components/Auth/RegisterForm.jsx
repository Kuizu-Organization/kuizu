import React, { useState } from 'react';
import { User, Mail, Lock, FileText, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi, verifyRegistration as verifyApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input, Button } from '../ui';

import './AuthForm.css';

const RegisterForm = ({ onToggle }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: '',
        bio: '',
        role: 'ROLE_STUDENT'
    });
    const [otpCode, setOtpCode] = useState('');
    const [isOtpStep, setIsOtpStep] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic frontend validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            const msg = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.';
            setError(msg);
            toast.error(msg);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await registerApi(formData);
            if (data.requireOtp) {
                setIsOtpStep(true);
                toast.success('Registration successful. Please check your email for the OTP code.');
            } else {
                await login(data, data.token);
                toast.success('Account created successfully!');
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        
        if (otpCode.length !== 6) {
            setError('OTP code must be 6 digits.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const data = await verifyApi(formData.email, otpCode);
            await login(data, data.token);
            toast.success('Account verified successfully!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (isOtpStep) {
        return (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Mail size={40} style={{ margin: '0 auto', color: 'var(--primary-color)' }} />
                    <h3 style={{ marginTop: '10px' }}>Verify Your Email</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>We sent a 6-digit OTP code to <br /><strong>{formData.email}</strong></p>
                </div>
                
                <Input
                    label="OTP Code"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                />
                
                {error && <p style={{ color: 'var(--danger-color)', fontSize: '0.9rem', marginTop: '-10px', marginBottom: '10px' }}>{error}</p>}
                
                <Button type="submit" isLoading={loading} className="w-full mt-4">
                    {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
            </form>
        );
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <Input
                label="Username"
                placeholder="Choose a username (3-50 chars)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                leftIcon={<User size={18} />}
                required
            />

            <Input
                label="Email"
                type="email"
                placeholder="Type your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail size={18} />}
                required
            />

            <div className="input-container">
                <label className="input-label">I am a...</label>
                <div className="role-selection-wrapper">
                    <Button
                        type="button"
                        variant={formData.role === 'ROLE_STUDENT' ? 'primary' : 'secondary'}
                        className="role-selection-btn"
                        onClick={() => setFormData({ ...formData, role: 'ROLE_STUDENT' })}
                    >
                        Student
                    </Button>
                    <Button
                        type="button"
                        variant={formData.role === 'ROLE_TEACHER' ? 'primary' : 'secondary'}
                        className="role-selection-btn"
                        onClick={() => setFormData({ ...formData, role: 'ROLE_TEACHER' })}
                    >
                        Teacher
                    </Button>
                </div>
            </div>

            <Input
                label="Display Name (Optional)"
                placeholder="Your public name (max 150 chars)"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                leftIcon={<Info size={18} />}
            />

            <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, 1 upper, 1 lower, 1 special"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock size={18} />}
                required
            />

            <p className="terms-text">
                By clicking Sign up, you accept Kuizu's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>

            <Button type="submit" isLoading={loading} className="w-full">
                {loading ? 'Creating account...' : 'Sign up'}
            </Button>

            <Button variant="ghost" className="w-full mt-4" onClick={onToggle}>
                Already have an account? Log in
            </Button>
        </form>
    );
};

export default RegisterForm;

