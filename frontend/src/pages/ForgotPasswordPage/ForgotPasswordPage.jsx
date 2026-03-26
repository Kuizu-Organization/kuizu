import React, { useState, useEffect } from 'react';
import { Mail, Lock, Key, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { forgotPassword, resetPassword, verifyRegistration, resendRegistrationOtp } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input, Button, Card, OtpInput } from '@/components/ui';

import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();

    // Parse query params
    const queryParams = new URLSearchParams(location.search);
    const initialEmail = queryParams.get('email') || '';
    const initialAction = queryParams.get('action') || 'reset'; // 'reset' or 'register'

    const [step, setStep] = useState(initialAction === 'register' ? 2 : 1);
    const [action, setAction] = useState(initialAction);
    const [email, setEmail] = useState(initialEmail);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (initialAction === 'register' && initialEmail) {
            setStep(2);
            setAction('register');
            setEmail(initialEmail);
        }
    }, [initialAction, initialEmail]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPassword(email);
            toast.success('Password reset code sent to your email.');
            setStep(2);
            setAction('reset');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reset code. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (action === 'reset') {
            await handleResetPassword();
        } else {
            await handleVerifyRegistration();
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!) and be at least 8 chars long.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, otpCode, newPassword);
            toast.success('Password reset successfully! You can now log in.');
            navigate('/auth');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password. Invalid OTP or expired.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyRegistration = async () => {
        if (otpCode.length !== 6) {
            toast.error('Please enter a 6-digit code.');
            return;
        }

        setLoading(true);

        try {
            const data = await verifyRegistration(email, otpCode);
            await login(data, data.token);
            toast.success('Account verified successfully! Welcome to Kuizu.');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            if (action === 'register') {
                await resendRegistrationOtp(email);
            } else {
                await forgotPassword(email);
            }
            toast.success('New 6-digit code sent to your email.');
            setOtpCode('');
            setResendCooldown(60);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to resend code. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <Card className="forgot-password-card">
                <div className="back-link">
                    <Link to="/auth">
                        <ArrowLeft size={18} /> Back to login
                    </Link>
                </div>

                {step === 1 ? (
                    <div className="fp-content">
                        <div className="fp-header">
                            <div className="fp-icon-wrapper">
                                <Key size={32} />
                            </div>
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

                            <Button type="submit" isLoading={loading} className="w-full mt-6">
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="fp-content">
                        <div className="fp-header">
                            <div className="fp-icon-wrapper">
                                {action === 'reset' ? <Lock size={32} /> : <Mail size={32} />}
                            </div>
                            <h2>{action === 'reset' ? 'Reset Password' : 'Verify Your Email'}</h2>
                            <p>
                                {action === 'reset'
                                    ? `We sent a 6-digit code to reset your password.`
                                    : `Please enter the 6-digit code we sent to verify your account.`}
                                <br /><strong>{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <label className="input-label" style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>6-Digit OTP</label>
                            <OtpInput
                                value={otpCode}
                                onChange={(val) => setOtpCode(val)}
                                disabled={loading}
                            />

                            {action === 'reset' && (
                                <>
                                    <Input
                                        label="New Password"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        leftIcon={<Lock size={18} />}
                                        required
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        }
                                    />

                                    <Input
                                        label="Confirm New Password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Retype new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        leftIcon={<Lock size={18} />}
                                        required
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        }
                                    />
                                </>
                            )}

                            <Button type="submit" isLoading={loading} className="w-full mt-6">
                                {loading ? 'Processing...' : (action === 'reset' ? 'Reset Password' : 'Verify Account')}
                            </Button>

                            <Button
                                variant="ghost"
                                type="button"
                                className="w-full mt-4"
                                onClick={handleResendOtp}
                                disabled={loading || resendCooldown > 0}
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : "Didn't get a code? Resend"}
                            </Button>
                        </form>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
