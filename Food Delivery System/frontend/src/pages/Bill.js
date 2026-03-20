import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Bill.css';

const Bill = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [qrSrc, setQrSrc] = useState('');
    const [paymentDone, setPaymentDone] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const navigate = useNavigate();
    const { user, addToast } = useAuth();

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(cart);

        if (cart.length === 0) {
            setTotal(0);
        } else {
            let calcTotal = 0;
            cart.forEach(item => {
                calcTotal += Number(item.price) * (item.qty || 1);
            });
            setTotal(calcTotal);

            const upiId = "demo@upi";
            const payee = "Eatify Food Delivery";
            const upiURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=${payee}&am=${calcTotal}`;
            setQrSrc(upiURL);
        }
    }, []);

    const handlePayment = async () => {
        setPaymentProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update order payment status
        const orderId = localStorage.getItem("currentOrderId");
        if (orderId) {
            try {
                await fetch(`${API_BASE}/orders/${orderId}/payment`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentStatus: 'Paid',
                        paymentId: 'PAY_' + Date.now(),
                        paymentMethod: 'UPI',
                    }),
                });

                // Update user order history for recommendations
                if (user?._id) {
                    await fetch(`${API_BASE}/users/update-history`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user._id,
                            items: cartItems.map(item => ({
                                foodId: item.id,
                                foodName: item.name,
                                category: item.category || 'other',
                            })),
                        }),
                    });
                }
            } catch (err) {
                console.error('Payment update error:', err);
            }
        }

        setPaymentDone(true);
        setPaymentProcessing(false);
        localStorage.removeItem("cart");
        localStorage.removeItem("currentOrderId");
        addToast('Payment Successful! ✅', 'success');

        setTimeout(() => navigate('/'), 3000);
    };

    return (
        <div className="bill-body">
            <div className="bill-box">
                {paymentDone ? (
                    <div className="payment-success">
                        <div className="success-icon">✅</div>
                        <h2>Payment Successful!</h2>
                        <p>Thank you for ordering with Eatify! 🎉</p>
                        <p className="redirect-msg">Redirecting to home...</p>
                    </div>
                ) : (
                    <>
                        <h2>🧾 Order Bill</h2>

                        <div id="billItems">
                            {cartItems.length === 0 ? (
                                <p className="empty-bill">🛒 Cart is empty</p>
                            ) : (
                                <>
                                    <div className="bill-header-row">
                                        <span>Item</span>
                                        <span>Qty</span>
                                        <span>Price</span>
                                    </div>
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="bill-item">
                                            <span className="bill-item-name">{item.name}</span>
                                            <span className="bill-item-qty">× {item.qty}</span>
                                            <span className="bill-item-price">₹{Number(item.price) * (item.qty || 1)}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="bill-divider"></div>
                        <div className="bill-total">
                            <div className="bill-row"><span>Subtotal</span><span>₹{total}</span></div>
                            <div className="bill-row"><span>Delivery</span><span className="free">FREE</span></div>
                            <div className="bill-row"><span>Tax (5%)</span><span>₹{Math.round(total * 0.05)}</span></div>
                            <div className="bill-row grand-total">
                                <span>Grand Total</span>
                                <span>₹{total + Math.round(total * 0.05)}</span>
                            </div>
                        </div>

                        {cartItems.length > 0 && (
                            <div className="payment-area">
                                <h3>📱 Scan to Pay via UPI</h3>
                                <img className="qr-code" src={qrSrc} alt="UPI QR Code" />
                                <button
                                    className="pay-btn"
                                    onClick={handlePayment}
                                    disabled={paymentProcessing}
                                >
                                    {paymentProcessing ? (
                                        <>
                                            <span className="pay-spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${total + Math.round(total * 0.05)}`
                                    )}
                                </button>
                            </div>
                        )}

                        {cartItems.length === 0 && (
                            <button className="pay-btn" onClick={() => navigate('/')}>Go Home</button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Bill;
