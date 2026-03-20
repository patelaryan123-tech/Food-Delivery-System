import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Checkout.css';

const Checkout = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    
    const [ecoToggle, setEcoToggle] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledTime, setScheduledTime] = useState('');
    const [userProfile, setUserProfile] = useState(null);

    const navigate = useNavigate();
    const { user, addToast } = useAuth();

    useEffect(() => {
        if (!user) {
            addToast('Please login first 🔐', 'warning');
            navigate('/login');
            return;
        }
        fetchUserProfile();
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(cart);
        if (cart.length === 0) {
            addToast('Cart is empty!', 'warning');
            navigate('/cart');
        }
    }, [user, navigate, addToast]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/users/profile/${user._id}`);
            const data = await res.json();
            setUserProfile(data);
            if (data.username) setName(data.username);
            // Default to first saved address if available
            if (data.savedAddresses?.length > 0) {
                const def = data.savedAddresses.find(a => a.isDefault) || data.savedAddresses[0];
                setAddress(def.address);
            }
        } catch (err) { console.error(err); }
    };

    const getTotal = () => cartItems.reduce((t, i) => t + i.price * i.qty, 0);

    const getFinalTotal = () => {
        const total = getTotal();
        if (couponApplied) {
            return total - couponApplied.discountAmount;
        }
        return total;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/coupons/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, orderTotal: getTotal() }),
            });
            const data = await res.json();
            if (!res.ok) {
                addToast(data.message, 'error');
                setCouponApplied(null);
                return;
            }
            setCouponApplied(data);
            addToast(data.message, 'success');
        } catch (err) { addToast('Failed to apply coupon', 'error'); }
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        
        if (!user || (user._id && typeof user._id === 'string' && user._id.startsWith('offline_'))) {
            addToast('Please login with a valid account to place orders 🔐', 'warning');
            navigate('/login');
            return;
        }

        if (paymentMethod === 'Wallet' && userProfile?.walletBalance < getFinalTotal()) {
            addToast('Insufficient Wallet Balance! Please add money. 💸', 'error');
            return;
        }

        setLoading(true);
        setStatus("📍 Finalizing delivery...");

        try {
            let lat = 23.0225; // Default for Ahmedabad
            let lng = 72.5714;

            // Geocode if address is modified
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const geoData = await geoRes.json();
            if (geoData.length > 0) {
                lat = parseFloat(geoData[0].lat);
                lng = parseFloat(geoData[0].lon);
            }

            localStorage.setItem("lat", lat);
            localStorage.setItem("lng", lng);

            const orderRes = await fetch(`${API_BASE}/orders/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    customerName: name,
                    phone,
                    address,
                    lat,
                    lng,
                    items: cartItems,
                    total: getTotal(),
                    discount: couponApplied?.discountAmount || 0,
                    couponCode: couponApplied ? couponCode : '',
                    finalTotal: getFinalTotal(),
                    paymentMethod,
                    ecoToggle,
                    isScheduled,
                    scheduledTime: isScheduled ? scheduledTime : null
                }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.message);

            localStorage.setItem("currentOrderId", orderData.orderId);
            addToast('Order placed successfully! 🎉', 'success');
            navigate('/order-tracking/' + orderData.orderId);

        } catch (err) {
            addToast(err.message || 'Failed to place order', 'error');
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <>
            <Navbar />
            <div className="checkout-body">
                <div className="checkout-container">
                    <h2>🛒 Checkout</h2>

                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        {cartItems.map((item, i) => (
                            <div key={i} className="summary-item">
                                <span>{item.name} × {item.qty}</span>
                                <span>₹{item.price * item.qty}</span>
                            </div>
                        ))}
                        <div className="summary-divider"></div>
                        <div className="summary-item total">
                            <strong>Total</strong>
                            <strong>₹{getFinalTotal()}</strong>
                        </div>
                    </div>

                    <div className="coupon-section">
                        <h3>🎟️ Apply Coupon</h3>
                        <div className="coupon-input-row">
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            />
                            <button onClick={handleApplyCoupon} className="apply-btn">Apply</button>
                        </div>
                    </div>

                    <div className="payment-section">
                        <h3>💳 Payment Method</h3>
                        <div className="payment-options">
                            {['Wallet', 'UPI', 'Cash on Delivery'].map(method => (
                                <label key={method} className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                    />
                                    <span>
                                        {method === 'Wallet' ? '👛' : method === 'UPI' ? '📱' : '💰'} 
                                        {method}
                                        {method === 'Wallet' && (
                                            <span className="wallet-bal"> (₹{userProfile?.walletBalance || 0})</span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <form className="checkout-form" onSubmit={handleConfirmOrder}>
                        <h3>📍 Delivery Details</h3>
                        
                        {userProfile?.savedAddresses?.length > 0 && (
                            <div className="saved-addresses">
                                <p>Select Saved Address:</p>
                                <div className="addr-grid">
                                    {userProfile.savedAddresses.map((a, i) => (
                                        <button key={i} type="button" 
                                            className={`addr-chip ${address === a.address ? 'active' : ''}`}
                                            onClick={() => setAddress(a.address)}
                                        >
                                            {a.label === 'Home' ? '🏠' : a.label === 'Work' ? '💼' : '📍'} {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input type="text" placeholder="Full Name" required
                            value={name} onChange={e => setName(e.target.value)} />
                        <input type="text" placeholder="Phone Number" required
                            value={phone} onChange={e => setPhone(e.target.value)} />
                        <textarea placeholder="Delivery Address"
                            required value={address} onChange={e => setAddress(e.target.value)} />
                        <div className="eco-toggle-row">
                            <label className="switch">
                                <input type="checkbox" checked={ecoToggle} onChange={() => setEcoToggle(!ecoToggle)} />
                                <span className="slider round"></span>
                            </label>
                            <span>🌱 Don't send cutlery (Eco-friendly) <strong style={{color: '#22c55e'}}>+5 Loyalty Points!</strong></span>
                        </div>

                        <div className="schedule-row">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={isScheduled} onChange={() => setIsScheduled(!isScheduled)} />
                                <span>📅 Schedule for later?</span>
                            </label>
                            {isScheduled && (
                                <input type="datetime-local" className="schedule-input"
                                    value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} required />
                            )}
                        </div>

                        <button type="submit" className="place-order-btn" disabled={loading}>
                            {loading ? '⏳ Placing Order...' : `Place Order • ₹${getFinalTotal()}`}
                        </button>
                    </form>

                    {status && <p className="status-msg">{status}</p>}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Checkout;
