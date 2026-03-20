import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout, darkMode, toggleDarkMode, notifications } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-inner">
                <Link to="/" className="logo">
                    <span className="logo-icon">🍽️</span>
                    <span className="logo-text">Eatify</span>
                </Link>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? '✕' : '☰'}
                </button>

                <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
                    <li><Link to="/restaurants" className={isActive('/restaurants')} onClick={() => setMenuOpen(false)}>Menu</Link></li>
                    <li><Link to="/cart" className={isActive('/cart')} onClick={() => setMenuOpen(false)}>🛒 Cart</Link></li>

                    {user && (
                        <>
                            <li><Link to="/orders" className={isActive('/orders')} onClick={() => setMenuOpen(false)}>📦 Orders</Link></li>
                            <li><Link to="/wallet" className={isActive('/wallet')} onClick={() => setMenuOpen(false)}>👛 Wallet</Link></li>
                            <li><Link to="/refer" className={isActive('/refer')} onClick={() => setMenuOpen(false)}>🤝 Refer</Link></li>
                            <li><Link to="/plus" className={isActive('/plus')} onClick={() => setMenuOpen(false)}>💎 Plus</Link></li>
                            {user.role === 'admin' && (
                                <li><Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>📊 Admin</Link></li>
                            )}
                            {user.role === 'delivery' && (
                                <li><Link to="/delivery-panel" className={isActive('/delivery-panel')} onClick={() => setMenuOpen(false)}>🛵 Delivery</Link></li>
                            )}
                        </>
                    )}

                    <li className="nav-actions">
                        <button className="dark-toggle" onClick={toggleDarkMode} title="Toggle Dark Mode">
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {user && (
                            <div className="notif-wrapper">
                                <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                                    🔔
                                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                                </button>
                                {notifOpen && (
                                    <div className="notif-dropdown">
                                        <h4>Notifications</h4>
                                        {notifications.length === 0 ? (
                                            <p className="notif-empty">No notifications yet</p>
                                        ) : (
                                            notifications.slice(0, 5).map((n, i) => (
                                                <div key={i} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                                                    <span className="notif-icon">{n.icon || '🔔'}</span>
                                                    <div>
                                                        <strong>{n.title}</strong>
                                                        <p>{n.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <div className="user-menu">
                                <span className={`tier-badge tier-${user.membershipTier?.toLowerCase() || 'bronze'}`}>
                                    {user.membershipTier || 'Bronze'}
                                </span>
                                <span className="user-avatar">👤</span>
                                <span className="user-name">{user.username}</span>
                                <button className="nav-btn logout-btn" onClick={logout}>Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="nav-btn" onClick={() => setMenuOpen(false)}>Login</Link>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
