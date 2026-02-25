import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../../api/auth';
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

            <div className="form-group">
                <label>Email or username</label>
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Type your email address or your username"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="label-row">
                    <label>Password</label>
                    <a href="/forgot-password" title="Forgot password?">Forgot password?</a>
                </div>
                <div className="input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Type your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <p className="terms-text">
                By clicking Log in, you accept Kuizu's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>

            <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
            </button>

            <button type="button" className="secondary-btn" onClick={onToggle}>
                New to Kuizu? Create an account
            </button>

            <button type="button" className="text-btn">
                Log in with a quick link
            </button>
        </form>
    );
};

export default LoginForm;
