import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Login.css';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { addToast } = useAuth();

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
                return;
            }

            setSuccess('Password reset successful! Redirecting...');
            addToast('Password reset successful! 🔐', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Server error. Please try again.');
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
                    <h2>Reset Password 🔐</h2>
                    <p>Enter your details to reset your password</p>

                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">{success}</div>}

                    <form onSubmit={handleReset}>
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
                                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <label>New Password</label>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? '⏳ Resetting...' : 'Reset Password'}
                        </button>
                        <p className="signup">Remember your password? <Link to="/login">Login</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
