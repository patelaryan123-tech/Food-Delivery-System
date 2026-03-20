import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/PlusSubscription.css';

const PlusSubscription = () => {
    const { user, addToast, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const handleSubscribe = async () => {
        if (!user) {
            addToast('Please login to subscribe', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/users/plus/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, plan: selectedPlan }),
            });
            const data = await res.json();

            if (res.ok) {
                addToast('Welcome to Eatify Plus! 🎉', 'success');
                // Update local user state
                const updatedUser = { ...user, isPlusMember: true, plusExpiry: data.plusExpiry };
                login(updatedUser);
            } else {
                addToast(data.message, 'error');
            }
        } catch (err) {
            addToast('Subscription failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="plus-page">
            <Navbar />
            <div className="plus-container">
                <div className="plus-hero">
                    <div className="plus-badge">ELITE</div>
                    <h1>Eatify<span>Plus</span></h1>
                    <p>Unlock ultimate savings and premium benefits</p>
                </div>

                <div className="benefits-grid">
                    <div className="benefit-card">
                        <span className="benefit-icon">🚚</span>
                        <h3>Free Delivery</h3>
                        <p>₹0 delivery fee on all orders above ₹199</p>
                    </div>
                    <div className="benefit-card">
                        <span className="benefit-icon">⚡</span>
                        <h3>Priority Delivery</h3>
                        <p>Get your food delivered faster than everyone else</p>
                    </div>
                    <div className="benefit-card">
                        <span className="benefit-icon">💎</span>
                        <h3>Exclusive Offers</h3>
                        <p>Access to 'Plus Only' discounts and early access</p>
                    </div>
                    <div className="benefit-card">
                        <span className="benefit-icon">☎️</span>
                        <h3>VIP Support</h3>
                        <p>24/7 priority customer support line</p>
                    </div>
                </div>

                <div className="plans-container">
                    <div 
                        className={`plan-card ${selectedPlan === 'monthly' ? 'active' : ''}`}
                        onClick={() => setSelectedPlan('monthly')}
                    >
                        <div className="plan-header">
                            <h4>Monthly</h4>
                            <div className="plan-price">₹149<span>/mo</span></div>
                        </div>
                        <ul className="plan-features">
                            <li>✅ All Plus Benefits</li>
                            <li>✅ Cancel anytime</li>
                        </ul>
                    </div>

                    <div 
                        className={`plan-card ${selectedPlan === 'yearly' ? 'active' : ''}`}
                        onClick={() => setSelectedPlan('yearly')}
                    >
                        <div className="best-value">POPULAR</div>
                        <div className="plan-header">
                            <h4>Yearly</h4>
                            <div className="plan-price">₹999<span>/yr</span></div>
                            <div className="savings">Save ₹789</div>
                        </div>
                        <ul className="plan-features">
                            <li>✅ All Plus Benefits</li>
                            <li>✅ 2 Months Free</li>
                            <li>✅ Priority Support</li>
                        </ul>
                    </div>
                </div>

                <div className="subscribe-action">
                    {user?.isPlusMember ? (
                        <div className="already-plus">
                            <h3>You are already a Plus Member! 🌟</h3>
                            <p>Expires on: {new Date(user.plusExpiry).toLocaleDateString()}</p>
                        </div>
                    ) : (
                        <button 
                            className="subscribe-btn" 
                            onClick={handleSubscribe}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Get Eatify Plus - ${selectedPlan === 'monthly' ? '₹149' : '₹999'}`}
                        </button>
                    )}
                    <p className="privacy-note">Secure payment via UPI/Cards. Terms apply.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PlusSubscription;
