import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Admin.css';

const Admin = () => {
    const [dashboard, setDashboard] = useState(null);
    const [allOrders, setAllOrders] = useState([]);
    const [allFoods, setAllFoods] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [foodForm, setFoodForm] = useState({ name: '', price: '', category: 'pizza', image: '', stockQty: 50 });

    const { user, addToast } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        console.log("Fetching data...");
        try {
            await Promise.all([fetchDashboard(), fetchAllOrders(), fetchAllFoods()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/dashboard`);
            const data = await res.json();
            setDashboard(data);
        } catch (err) {
            console.error("Dashboard error:", err);
        }
    };

    const fetchAllOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders`);
            const data = await res.json();
            setAllOrders(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Orders error:", err); }
    };

    const fetchAllFoods = async () => {
        try {
            const res = await fetch(`${API_BASE}/food`);
            const data = await res.json();
            setAllFoods(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Foods error:", err); }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                addToast(`Order updated to ${newStatus} ✅`, 'success');
                fetchAllOrders();
                fetchDashboard();
            }
        } catch (err) { addToast('Failed to update status', 'error'); }
    };

    const handleDeleteFood = async (foodId) => {
        if (!window.confirm('Are you sure you want to delete this item? ⚠️')) return;
        try {
            const res = await fetch(`${API_BASE}/food/${foodId}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Item deleted successfully!', 'info');
                fetchAllFoods();
                fetchDashboard();
            }
        } catch (err) { addToast('Error deleting item', 'error'); }
    };

    const handleEditFood = (food) => {
        setEditingFood(food);
        setFoodForm({
            name: food.name,
            price: food.price,
            category: food.category,
            image: food.image,
            stockQty: food.stockQty
        });
        setIsFoodModalOpen(true);
    };

    const handleFoodSubmit = async (e) => {
        e.preventDefault();
        const url = editingFood ? `${API_BASE}/food/${editingFood._id}` : `${API_BASE}/food`;
        const method = editingFood ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(foodForm),
            });
            if (res.ok) {
                addToast(editingFood ? 'Food updated! ✨' : 'Food added! 🎉', 'success');
                setIsFoodModalOpen(false);
                setEditingFood(null);
                fetchAllFoods();
                fetchDashboard();
            }
        } catch (err) { addToast('Error saving food profile', 'error'); }
    };

    if (loading) return (
        <><Navbar /><div className="admin-loading"><div className="spinner-ring"><div></div></div><p>Syncing Eatify Dashboard...</p></div></>
    );

    return (
        <>
            <Navbar />
            <div className="admin-body">
                <div className="admin-header">
                    <h1>⚙️ Control Panel</h1>
                    <div className="admin-seed-actions">
                        <button onClick={fetchData} className="refresh-btn">🔄 Refresh Data</button>
                    </div>
                </div>

                <div className="admin-tabs">
                    {['overview', 'orders', 'menu', 'analytics'].map(tab => (
                        <button key={tab} className={`admin-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'overview' ? '📋 Stats' : tab === 'orders' ? '📦 Tracking' : tab === 'menu' ? '🍕 Menu' : '📊 Analytics'}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW */}
                {activeTab === 'overview' && dashboard && (
                    <div className="admin-content">
                        <div className="stats-grid">
                            <div className="stat-card revenue">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info"><h3>₹{dashboard.totalRevenue?.toLocaleString()}</h3><p>Total Revenue</p></div>
                            </div>
                            <div className="stat-card orders">
                                <div className="stat-icon">🛍️</div>
                                <div className="stat-info"><h3>{dashboard.totalOrders}</h3><p>Live Orders</p></div>
                            </div>
                            <div className="stat-card users">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info"><h3>{dashboard.totalUsers}</h3><p>Total Customers</p></div>
                            </div>
                            <div className="stat-card partners">
                                <div className="stat-icon">🏎️</div>
                                <div className="stat-info"><h3>{dashboard.totalDeliveryPartners}</h3><p>Partners</p></div>
                            </div>
                        </div>

                        <div className="chart-section">
                            <h3>🚀 Live Status Tracker</h3>
                            <div className="status-chart">
                                {dashboard.ordersByStatus?.map(s => (
                                    <div key={s._id} className="status-bar-item">
                                        <div className="status-bar-label">{s._id}</div>
                                        <div className="status-bar-track">
                                            <div className="status-bar-fill" style={{ width: `${(s.count / (dashboard.totalOrders || 1)) * 100}%` }}></div>
                                        </div>
                                        <span className="status-bar-count">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                    <div className="admin-content">
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr><th>ID</th><th>User</th><th>Paid Total</th><th>Current Status</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {allOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-6)}</td>
                                            <td>{order.customerName}</td>
                                            <td>₹{order.finalTotal}</td>
                                            <td><span className={`status-badge status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span></td>
                                            <td>
                                                <select value={order.status} onChange={e => handleStatusUpdate(order._id, e.target.value)} className="status-select">
                                                    {['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MENU MANAGEMENT */}
                {activeTab === 'menu' && (
                    <div className="admin-content">
                        <div className="admin-actions-row">
                            <h3>🍽️ Food Menu ({allFoods.length})</h3>
                            <button className="add-food-btn" onClick={() => { setEditingFood(null); setFoodForm({ name: '', price: '', category: 'pizza', image: '', stockQty: 50 }); setIsFoodModalOpen(true); }}>
                                ➕ Add Item
                            </button>
                        </div>
                        <div className="menu-grid">
                            {allFoods.map(food => (
                                <div key={food._id} className="menu-card">
                                    <img src={food.image} alt={food.name} className="menu-card-img" />
                                    <div className="menu-card-info">
                                        <h4>{food.name}</h4>
                                        <p>₹{food.price} • {food.category}</p>
                                        <div className="menu-card-actions">
                                            <button className="edit-btn" onClick={() => handleEditFood(food)}>✏️ Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteFood(food._id)}>🗑️ Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ANALYTICS */}
                {activeTab === 'analytics' && dashboard && (
                    <div className="admin-content">
                        <div className="chart-section">
                            <h3>⭐ Top-Selling Items</h3>
                            <div className="popular-chart">
                                {dashboard.popularItems?.map((item, i) => (
                                    <div key={i} className="popular-item">
                                        <span className="popular-rank">#{i + 1}</span>
                                        <span className="popular-name">{item.name}</span>
                                        <div className="popular-bar-track">
                                            <div className="popular-bar-fill" style={{ width: `${(item.count / 100) * 100}%` }}></div>
                                        </div>
                                        <span className="popular-count">{item.count} items sold</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isFoodModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h2>{editingFood ? '📝 Edit Dish' : '🍕 Add New Dish'}</h2>
                            <button onClick={() => setIsFoodModalOpen(false)}>✕</button>
                        </div>
                        <form className="admin-form" onSubmit={handleFoodSubmit}>
                            <label>Dish Name</label>
                            <input type="text" placeholder="e.g. Cheese Pizza" value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })} required />
                            
                            <label>Price (₹)</label>
                            <input type="number" placeholder="199" value={foodForm.price} onChange={e => setFoodForm({ ...foodForm, price: e.target.value })} required />
                            
                            <label>Category</label>
                            <select value={foodForm.category} onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}>
                                <option value="pizza">Pizza 🍕</option>
                                <option value="burger">Burger 🍔</option>
                                <option value="biryani">Biryani 🍱</option>
                                <option value="dessert">Dessert 🧁</option>
                            </select>
                            
                            <label>Image Path</label>
                            <input type="text" placeholder="/images/pizza1.jpg" value={foodForm.image} onChange={e => setFoodForm({ ...foodForm, image: e.target.value })} />
                            
                            <div className="form-actions">
                                <button type="submit" className="save-btn">{editingFood ? 'Update Dish' : 'Add to Menu'}</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsFoodModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Admin;
