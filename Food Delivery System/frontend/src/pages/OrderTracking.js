import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/OrderTracking.css';

const statusSteps = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(30);
    const navigate = useNavigate();
    const { addToast } = useAuth();

    useEffect(() => {
        if (!orderId) return;

        // Fetch order
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API_BASE}/orders/${orderId}`);
                const data = await res.json();
                setOrder(data);
                const stepIdx = statusSteps.indexOf(data.status);
                setCurrentStep(stepIdx >= 0 ? stepIdx : 0);
            } catch (err) {
                console.error('Failed to fetch order');
            }
        };

        fetchOrder();

        // Simulate real-time status updates with setInterval
        const statusInterval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/orders/${orderId}`);
                const data = await res.json();
                setOrder(data);
                const stepIdx = statusSteps.indexOf(data.status);
                if (stepIdx >= 0) setCurrentStep(stepIdx);
            } catch (err) {}
        }, 5000);

        // Simulate status progression for demo
        let demoStep = 0;
        const demoInterval = setInterval(async () => {
            demoStep++;
            if (demoStep >= statusSteps.length) {
                clearInterval(demoInterval);
                return;
            }

            const newStatus = statusSteps[demoStep];
            setCurrentStep(demoStep);
            setEstimatedTime(prev => Math.max(0, prev - 8));

            try {
                await fetch(`${API_BASE}/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });
            } catch (err) {}

            if (demoStep === 4) {
                addToast('Your order has been delivered! 🎉', 'success');
                setTimeout(() => navigate('/bill'), 2000);
            }
        }, 8000);

        // Countdown timer
        const timerInterval = setInterval(() => {
            setEstimatedTime(prev => {
                if (prev <= 0) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 60000);

        return () => {
            clearInterval(statusInterval);
            clearInterval(demoInterval);
            clearInterval(timerInterval);
        };
    }, [orderId, navigate, addToast]);

    const getStatusIcon = (step, index) => {
        const icons = ['📋', '✅', '👨‍🍳', '🚴', '🎉'];
        return icons[index];
    };

    const getStatusDescription = (index) => {
        const descriptions = [
            'Your order has been placed successfully',
            'Restaurant has confirmed your order',
            'Chef is preparing your delicious food',
            'Delivery partner is on the way',
            'Order delivered! Enjoy your meal'
        ];
        return descriptions[index];
    };

    return (
        <>
            <Navbar />
            <div className="tracking-body">
                <div className="tracking-container">
                    <div className="tracking-header">
                        <h2>📦 Order Tracking</h2>
                        {order && (
                            <div className="order-id-badge">
                                Order #{orderId?.slice(-6)}
                            </div>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="eta-card">
                        <div className="eta-circle">
                            <span className="eta-time">{estimatedTime}</span>
                            <span className="eta-label">min</span>
                        </div>
                        <div className="eta-info">
                            <h3>Estimated Delivery</h3>
                            <p>{currentStep === 4 ? 'Delivered! 🎉' : `${estimatedTime} minutes remaining`}</p>
                        </div>
                    </div>

                    {/* Status Steps */}
                    <div className="tracking-steps">
                        {statusSteps.map((step, index) => (
                            <div
                                key={step}
                                className={`tracking-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                            >
                                <div className="step-indicator">
                                    <div className="step-circle">
                                        {index <= currentStep ? getStatusIcon(step, index) : (index + 1)}
                                    </div>
                                    {index < statusSteps.length - 1 && (
                                        <div className={`step-line ${index < currentStep ? 'filled' : ''}`}></div>
                                    )}
                                </div>
                                <div className="step-info">
                                    <h4>{step}</h4>
                                    <p>{getStatusDescription(index)}</p>
                                    {index <= currentStep && order?.statusHistory?.[index] && (
                                        <span className="step-time">
                                            {new Date(order.statusHistory[index].timestamp).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Details */}
                    {order && (
                        <div className="tracking-details">
                            <h3>Order Details</h3>
                            <div className="detail-row">
                                <span>📍 Delivery to:</span>
                                <span>{order.address}</span>
                            </div>
                            <div className="detail-row">
                                <span>🧑 Name:</span>
                                <span>{order.customerName}</span>
                            </div>
                            <div className="detail-row">
                                <span>📞 Phone:</span>
                                <span>{order.phone}</span>
                            </div>
                            <div className="detail-row">
                                <span>💰 Total:</span>
                                <span>₹{order.finalTotal || order.total}</span>
                            </div>
                            {order.deliveryBoyName && (
                                <div className="detail-row">
                                    <span>🛵 Delivery by:</span>
                                    <span>{order.deliveryBoyName}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="tracking-actions">
                        <button className="track-map-btn" onClick={() => navigate('/delivery')}>
                            🗺️ View on Map
                        </button>
                        <button className="track-help-btn" onClick={() => navigate('/orders')}>
                            📦 All Orders
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderTracking;
