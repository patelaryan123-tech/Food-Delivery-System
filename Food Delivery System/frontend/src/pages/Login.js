import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login: authLogin, addToast } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login failed');
                return;
            }

            authLogin(data);
            addToast(`Welcome back, ${data.username}! 🎉`, 'success');
            
            // Redirect based on role
            if (data.role === 'admin') navigate('/admin');
            else if (data.role === 'delivery') navigate('/delivery-panel');
            else navigate('/');
        } catch (err) {
            setError('Server connection failed. Please ensure the backend is running.');
            addToast('Could not connect to server 🌐', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="login-bg">
                    <div className="circle circle1"></div>
                    <div className="circle circle2"></div>
                    <div className="circle circle3"></div>
                </div>

                <div className="login-card">
                    <h2>Welcome Back! 👋</h2>
                    <p>Sign in to continue ordering delicious food</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input type="text" id="username" required placeholder=" "
                                value={username} onChange={e => setUsername(e.target.value)} />
                            <label>Username</label>
                        </div>

                        <div className="input-group">
                            <input type="password" id="password" required placeholder=" "
                                value={password} onChange={e => setPassword(e.target.value)} />
                            <label>Password</label>
                        </div>

                        <div className="forgot-link">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? '⏳ Signing in...' : 'Login'}
                        </button>
                        <p className="signup">New here? <Link to="/register">Create Account</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
