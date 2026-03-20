import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/DeliveryPartner.css';

const DeliveryPartner = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const { user, addToast } = useAuth();

    useEffect(() => {
        fetchPendingOrders();
        if (user) fetchMyOrders();
    }, [user]);

    const fetchPendingOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/delivery-pending/all`);
            const data = await res.json();
            setPendingOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setPendingOrders([]);
        }
        setLoading(false);
    };

    const fetchMyOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/delivery/${user?.username}`);
            const data = await res.json();
            setMyOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setMyOrders([]);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Out for Delivery',
                    deliveryBoyName: user?.username || 'Delivery Partner',
                }),
            });
            addToast('Order accepted! 🚴', 'success');
            fetchPendingOrders();
            fetchMyOrders();
        } catch (err) {
            addToast('Failed to accept order', 'error');
        }
    };

    const handleDeliverOrder = async (orderId) => {
        try {
            await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Delivered' }),
            });

            await fetch(`${API_BASE}/orders/${orderId}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'Paid' }),
            });

            addToast('Order marked as delivered! ✅', 'success');
            fetchMyOrders();
        } catch (err) {
            addToast('Failed to update', 'error');
        }
    };

    return (
        <>
            <Navbar />
            <div className="dp-body">
                <div className="dp-container">
                    <div className="dp-header">
                        <h1>🛵 Delivery Partner Panel</h1>
                        <div className="dp-status">
                            <span className="dp-online">● Online</span>
                            <span className="dp-name">{user?.username}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="dp-stats">
                        <div className="dp-stat">
                            <h3>{pendingOrders.length}</h3>
                            <p>Available Orders</p>
                        </div>
                        <div className="dp-stat">
                            <h3>{myOrders.length}</h3>
                            <p>Active Deliveries</p>
                        </div>
                        <div className="dp-stat">
                            <h3>{myOrders.filter(o => o.status === 'Delivered').length}</h3>
                            <p>Completed Today</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="dp-tabs">
                        <button className={activeTab === 'pending' ? 'active' : ''}
                            onClick={() => setActiveTab('pending')}>
                            📋 Available ({pendingOrders.length})
                        </button>
                        <button className={activeTab === 'active' ? 'active' : ''}
                            onClick={() => setActiveTab('active')}>
                            🚴 My Deliveries ({myOrders.length})
                        </button>
                    </div>

                    {/* Pending Orders */}
                    {activeTab === 'pending' && (
                        <div className="dp-orders">
                            {pendingOrders.length === 0 ? (
                                <div className="dp-empty">
                                    <span>📭</span>
                                    <p>No pending orders right now</p>
                                </div>
                            ) : (
                                pendingOrders.map(order => (
                                    <div key={order._id} className="dp-order-card">
                                        <div className="dp-order-header">
                                            <span className="dp-order-id">#{order._id.slice(-6)}</span>
                                            <span className="dp-order-status">{order.status}</span>
                                        </div>
                                        <div className="dp-order-info">
                                            <p>📍 {order.address}</p>
                                            <p>🧑 {order.customerName}</p>
                                            <p>📞 {order.phone}</p>
                                            <p>🛒 {order.items.map(i => i.name).join(', ')}</p>
                                            <p className="dp-order-total">💰 ₹{order.finalTotal || order.total}</p>
                                        </div>
                                        <button className="accept-btn" onClick={() => handleAcceptOrder(order._id)}>
                                            ✅ Accept Order
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Active Deliveries */}
                    {activeTab === 'active' && (
                        <div className="dp-orders">
                            {myOrders.length === 0 ? (
                                <div className="dp-empty">
                                    <span>📦</span>
                                    <p>No active deliveries</p>
                                </div>
                            ) : (
                                myOrders.map(order => (
                                    <div key={order._id} className="dp-order-card active-delivery">
                                        <div className="dp-order-header">
                                            <span className="dp-order-id">#{order._id.slice(-6)}</span>
                                            <span className="dp-order-status active">{order.status}</span>
                                        </div>
                                        <div className="dp-order-info">
                                            <p>📍 {order.address}</p>
                                            <p>🧑 {order.customerName}</p>
                                            <p>📞 {order.phone}</p>
                                            <p className="dp-order-total">💰 ₹{order.finalTotal || order.total}</p>
                                        </div>
                                        {order.status !== 'Delivered' && (
                                            <button className="deliver-btn" onClick={() => handleDeliverOrder(order._id)}>
                                                ✅ Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default DeliveryPartner;
