import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { login } from '../../api/auth';
import { Input, Button } from '../ui';
import './AuthForm.css';

const LoginForm = ({ onToggle }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(formData.identifier, formData.password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}

            <Input
                label="Email or Username"
                placeholder="Type your email address or your username"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                leftIcon={<Mail size={18} />}
                required
            />

            <div className="input-container">
                <div className="label-row">
                    <label className="input-label">Password</label>
                    <a href="/forgot-password" title="Forgot password?">Forgot password?</a>
                </div>
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Type your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    leftIcon={<Lock size={18} />}
                    rightIcon={
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                    required
                />
            </div>

            <p className="terms-text">
                By clicking Log in, you accept Kuizu's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>

            <Button type="submit" isLoading={loading} className="w-full">
                {loading ? 'Logging in...' : 'Log in'}
            </Button>

            <Button variant="ghost" className="w-full mt-4" onClick={onToggle}>
                New to Kuizu? Create an account
            </Button>
        </form>
    );
};

export default LoginForm;
