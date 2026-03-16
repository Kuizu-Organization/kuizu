import React, { useState } from 'react';
import { Mail, Lock, Key, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { Input, Button } from '../../components/ui';

import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await forgotPassword(email);
            toast.success('Password reset code sent to your email.');
            setStep(2);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reset code. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password must contain upper, lower, special character and min 8 chars.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await resetPassword(email, otpCode, newPassword);
            toast.success('Password reset successfully! You can now log in.');
            navigate('/auth');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password. Invalid OTP or expired.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="auth-card forgot-password-card">
                <div className="back-link">
                    <Link to="/auth">
                        <ArrowLeft size={18} /> Back to login
                    </Link>
                </div>
                
                {step === 1 ? (
                    <div className="fp-content">
                        <div className="fp-header">
                            <Key size={48} className="fp-icon" />
                            <h2>Forgot Password?</h2>
                            <p>Enter your email address to receive a 6-digit reset code.</p>
                        </div>
                        
                        <form onSubmit={handleRequestOtp} className="auth-form">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                leftIcon={<Mail size={18} />}
                                required
                            />
                            
                            {error && <p className="error-msg">{error}</p>}
                            
                            <Button type="submit" isLoading={loading} className="w-full mt-4">
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="fp-content">
                        <div className="fp-header">
                            <Lock size={48} className="fp-icon" />
                            <h2>Reset Password</h2>
                            <p>We sent a 6-digit code to <strong>{email}</strong></p>
                        </div>
                        
                        <form onSubmit={handleResetPassword} className="auth-form">
                            <Input
                                label="6-Digit OTP"
                                placeholder="Enter code"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                required
                            />
                            
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="Min 8 chars, 1 upper, 1 lower, 1 special"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                leftIcon={<Lock size={18} />}
                                required
                            />
                            
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="Retype new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                leftIcon={<Lock size={18} />}
                                required
                            />
                            
                            {error && <p className="error-msg">{error}</p>}
                            
                            <Button type="submit" isLoading={loading} className="w-full mt-4">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
