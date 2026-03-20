import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Footer.css';

const Footer = () => {
    const { darkMode } = useAuth();

    return (
        <footer className={`site-footer ${darkMode ? 'dark' : ''}`}>
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>🍽️ Eatify</h3>
                    <p>Delicious food, delivered fast to your doorstep.</p>
                </div>
                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/restaurants">Menu</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/orders">Orders</Link>
                </div>
                <div className="footer-links">
                    <h4>Support</h4>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                    <a href="#">Help Center</a>
                    <a href="#">Contact Us</a>
                </div>
                <div className="footer-links">
                    <h4>Offers</h4>
                    <p>Use code <strong>WELCOME50</strong> for 50% off!</p>
                    <p>Use code <strong>EATIFY20</strong> for 20% off!</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 Eatify • All Rights Reserved • Made with ❤️</p>
            </div>
        </footer>
    );
};

export default Footer;
