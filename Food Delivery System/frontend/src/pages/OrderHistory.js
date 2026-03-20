import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const { user, addToast } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/user/${user._id}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            // Use local fallback
            setOrders([]);
        }
        setLoading(false);
    };

    const handleReorder = (order) => {
        const cart = order.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image || '/images/pizza1.jpg',
            qty: item.qty || 1,
        }));

        localStorage.setItem("cart", JSON.stringify(cart));
        addToast('Items added to cart! 🛒', 'success');
        navigate('/cart');
    };

    const handleTrackOrder = (orderId) => {
        navigate(`/order-tracking/${orderId}`);
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelled' }),
            });
            const data = await res.json();
            if (res.ok) {
                addToast('Order cancelled successfully! 😢', 'info');
                fetchOrders();
            } else {
                addToast(data.message || 'Error cancelling order', 'error');
            }
        } catch (err) {
            addToast('Error connecting to server', 'error');
        }
    };

    const StatusColors = {
        'Placed': '#f59e0b',
        'Confirmed': '#3b82f6',
        'Preparing': '#8b5cf6',
        'Out for Delivery': '#f97316',
        'Delivered': '#22c55e',
        'Cancelled': '#ef4444',
    };

    return (
        <>
            <Navbar />
            <div className="orders-body">
                <div className="orders-container">
                    <h2>📦 Order History</h2>

                    <div className="order-filters">
                        {['all', 'Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(f => (
                            <button
                                key={f}
                                className={`order-filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? '📋 All' : f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="orders-loading">
                            <div className="spinner-ring"><div></div><div></div><div></div><div></div></div>
                            <p>Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="no-orders">
                            <span className="no-orders-icon">📭</span>
                            <h3>No orders yet</h3>
                            <p>Start ordering delicious food!</p>
                            <button onClick={() => navigate('/restaurants')}>Browse Menu</button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {filteredOrders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-card-header">
                                        <div className="order-id">
                                            <span>Order #{order._id.slice(-6)}</span>
                                            <span className="order-date">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <span
                                            className="order-status-badge"
                                            style={{ background: StatusColors[order.status] || '#6b7280' }}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="order-items-preview">
                                        {order.items.slice(0, 3).map((item, j) => (
                                            <span key={j} className="item-tag">
                                                {item.name} × {item.qty}
                                            </span>
                                        ))}
                                        {order.items.length > 3 && (
                                            <span className="item-tag more">+{order.items.length - 3} more</span>
                                        )}
                                    </div>

                                    <div className="order-card-footer">
                                        <div className="order-total">
                                            <span>Total: </span>
                                            <strong>₹{order.finalTotal || order.total}</strong>
                                            {order.discount > 0 && (
                                                <span className="saved-badge">Saved ₹{order.discount}</span>
                                            )}
                                        </div>
                                        <div className="order-actions">
                                            {order.status === 'Placed' && (
                                                <button className="cancel-order-btn" onClick={() => handleCancelOrder(order._id)}>
                                                    ❌ Cancel
                                                </button>
                                            )}
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <button className="track-btn" onClick={() => handleTrackOrder(order._id)}>
                                                    📍 Track
                                                </button>
                                            )}
                                            <button className="reorder-btn" onClick={() => handleReorder(order)}>
                                                🔄 Reorder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderHistory;
