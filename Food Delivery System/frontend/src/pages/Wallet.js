import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Wallet.css';

const Wallet = () => {
    const { user, addToast } = useAuth();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (user) fetchBalance();
    }, [user]);

    const fetchBalance = async () => {
        try {
            const res = await fetch(`${API_BASE}/users/profile/${user._id}`);
            const data = await res.json();
            setBalance(data.walletBalance || 0);
            // Simulate some transactions
            setHistory([
                { id: 1, type: 'Credit', amount: 500, date: '2026-03-15', status: 'Success' },
                { id: 2, type: 'Debit', amount: 340, date: '2026-03-14', status: 'Order #7721' },
            ]);
        } catch (err) { console.error(err); }
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/users/wallet/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, amount: parseFloat(amount) }),
            });
            const data = await res.json();
            if (res.ok) {
                setBalance(data.walletBalance);
                addToast(`₹${amount} added to wallet! 💰`, 'success');
                setAmount('');
            }
        } catch (err) { addToast('Failed to add money', 'error'); }
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="wallet-body">
                <div className="wallet-container">
                    <div className="wallet-card">
                        <div className="wallet-header">
                            <h2>👛 Eatify Wallet</h2>
                            <span className="wallet-badge">Active</span>
                        </div>
                        <div className="balance-section">
                            <p>Current Balance</p>
                            <h1>₹{balance.toFixed(2)}</h1>
                        </div>
                        <form className="add-money-form" onSubmit={handleAddMoney}>
                            <input 
                                type="number" 
                                placeholder="Enter Amount (₹)" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                required 
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Processing...' : 'Add Money'}
                            </button>
                        </form>
                    </div>

                    <div className="wallet-stats">
                        <div className="stat-item">
                            <span>Total Saved</span>
                            <h3>₹1,240</h3>
                        </div>
                        <div className="stat-item">
                            <span>Cashback Won</span>
                            <h3>₹150</h3>
                        </div>
                    </div>

                    <div className="transaction-history">
                        <h3>Recent Transactions</h3>
                        {history.map(t => (
                            <div key={t.id} className="transaction-item">
                                <div className="t-info">
                                    <strong>{t.type}</strong>
                                    <span>{t.date}</span>
                                </div>
                                <div className={`t-amount ${t.type === 'Credit' ? 'plus' : 'minus'}`}>
                                    {t.type === 'Credit' ? '+' : '-'}₹{t.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Wallet;
