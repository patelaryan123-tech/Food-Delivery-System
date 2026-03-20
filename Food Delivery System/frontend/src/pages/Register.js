import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Login.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, addToast } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
                return;
            }

            login(data);
            addToast('Account created successfully! 🎉', 'success');
            navigate('/');
        } catch (err) {
            setError('Server connection failed');
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
                    <h2>Create Account 🚀</h2>
                    <p>Join Eatify and start ordering!</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <input type="text" required placeholder=" "
                                value={username} onChange={e => setUsername(e.target.value)} />
                            <label>Username</label>
                        </div>

                        <div className="input-group">
                            <input type="email" required placeholder=" "
                                value={email} onChange={e => setEmail(e.target.value)} />
                            <label>Email Address</label>
                        </div>

                        <div className="input-group">
                            <input type="password" required placeholder=" " minLength="6"
                                value={password} onChange={e => setPassword(e.target.value)} />
                            <label>Password</label>
                        </div>

                        <div className="input-group">
                            <input type="password" required placeholder=" "
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            <label>Confirm Password</label>
                        </div>

                        <div className="input-group role-select">
                            <select value={role} onChange={e => setRole(e.target.value)}>
                                <option value="customer">🛒 Customer</option>
                                <option value="delivery">🛵 Delivery Partner</option>
                                <option value="admin">👨‍💼 Admin</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? '⏳ Creating...' : 'Register'}
                        </button>
                        <p className="signup">Already have an account? <Link to="/login">Login</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
