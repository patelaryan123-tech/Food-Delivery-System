import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/ReferAndEarn.css';

const ReferAndEarn = () => {
    const { user, addToast } = useAuth();
    const [referralCode, setReferralCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ referred: 0, earned: 0 });

    useEffect(() => {
        if (user) {
            fetchReferralData();
        }
    }, [user]);

    const fetchReferralData = async () => {
        try {
            const res = await fetch(`${API_BASE}/users/referral/code/${user._id}`);
            const data = await res.json();
            setReferralCode(data.referralCode);

            // Mocking stats for now, real app would have a 'referredUsers' list
            const profileRes = await fetch(`${API_BASE}/users/profile/${user._id}`);
            const profileData = await profileRes.json();
            // Assuming we track this in the future
        } catch (err) {
            console.error('Failed to fetch referral data');
        }
    };

    const handleApplyCode = async () => {
        if (!inputCode.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/users/referral/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, code: inputCode }),
            });
            const data = await res.json();

            if (res.ok) {
                addToast(data.message, 'success');
                setInputCode('');
            } else {
                addToast(data.message, 'error');
            }
        } catch (err) {
            addToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        addToast('Referral code copied! 📋', 'success');
    };

    return (
        <div className="refer-page">
            <Navbar />
            <div className="refer-container">
                <div className="refer-hero">
                    <h1>🤝 Refer & Earn</h1>
                    <p>Share the love for food and get rewarded!</p>
                </div>

                <div className="refer-grid">
                    <div className="refer-card share-card">
                        <h3>Your Referral Code</h3>
                        <p>Share this code with your friends. When they join and order, both of you get <strong>₹50</strong> in your wallet!</p>
                        
                        <div className="code-box">
                            <span className="code-text">{referralCode || 'Generating...'}</span>
                            <button onClick={copyToClipboard} className="copy-btn">Copy</button>
                        </div>

                        <div className="share-icons">
                            <button className="share-btn whatsapp">WhatsApp</button>
                            <button className="share-btn twitter">Twitter</button>
                            <button className="share-btn email">Email</button>
                        </div>
                    </div>

                    <div className="refer-card apply-card">
                        <h3>Been Referred?</h3>
                        <p>Enter a referral code from a friend to get <strong>₹50</strong> instant credits!</p>
                        
                        <div className="apply-box">
                            <input 
                                type="text" 
                                placeholder="Enter Referral Code" 
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />
                            <button 
                                onClick={handleApplyCode} 
                                disabled={loading || !inputCode}
                            >
                                {loading ? 'Applying...' : 'Apply Code'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="refer-stats">
                    <div className="stat-card">
                        <h4>Total Referred</h4>
                        <span className="stat-num">{stats.referred}</span>
                    </div>
                    <div className="stat-card">
                        <h4>Total Earned</h4>
                        <span className="stat-num">₹{stats.earned}</span>
                    </div>
                    <div className="stat-card">
                        <h4>Wallet Balance</h4>
                        <span className="stat-num">₹{user?.walletBalance || 0}</span>
                    </div>
                </div>

                <div className="refer-steps">
                    <h2>How it works?</h2>
                    <div className="steps-container">
                        <div className="step">
                            <div className="step-num">1</div>
                            <p>Share your unique referral code with friends.</p>
                        </div>
                        <div className="step">
                            <div className="step-num">2</div>
                            <p>They sign up and apply your code.</p>
                        </div>
                        <div className="step">
                            <div className="step-num">3</div>
                            <p>Both of you get ₹50 credits instantly!</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ReferAndEarn;
