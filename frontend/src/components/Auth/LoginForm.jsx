import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login as loginApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginApi(formData.identifier, formData.password);
            await login(data, data.token);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            toast.error(msg);
        } finally {

            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
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
                    <Link to="/forgot-password" title="Forgot password?">Forgot password?</Link>
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
