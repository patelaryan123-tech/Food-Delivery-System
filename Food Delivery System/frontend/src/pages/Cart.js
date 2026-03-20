import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const { user, addToast } = useAuth();

    useEffect(() => {
        if (!user) {
            addToast('Please login to view cart 🔐', 'warning');
            navigate('/login');
            return;
        }
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(storedCart);
    }, [user, navigate, addToast]);

    const updateCart = (newCart) => {
        setCartItems(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const handleIncrement = (index) => {
        const newCart = [...cartItems];
        newCart[index].qty++;
        updateCart(newCart);
    };

    const handleDecrement = (index) => {
        const newCart = [...cartItems];
        if (newCart[index].qty > 1) {
            newCart[index].qty--;
        } else {
            newCart.splice(index, 1);
            addToast('Item removed from cart', 'info');
        }
        updateCart(newCart);
    };

    const handleRemove = (index) => {
        const newCart = [...cartItems];
        const itemName = newCart[index].name;
        newCart.splice(index, 1);
        updateCart(newCart);
        addToast(`${itemName} removed 🗑️`, 'info');
    };

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
    const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            addToast('Your cart is empty!', 'warning');
            return;
        }
        navigate('/checkout');
    };

    return (
        <>
            <Navbar />
            <div className="cart-body">
                <div className="cart-container">
                    <div className="cart-bg">
                        <div className="circle circle1"></div>
                        <div className="circle circle2"></div>
                        <div className="circle circle3"></div>
                    </div>

                    <h1>🛒 Your Cart</h1>

                    <div className="cart-items">
                        {cartItems.length === 0 ? (
                            <div className="cart-empty">
                                <span className="empty-icon">🛒</span>
                                <h3>Your cart is empty</h3>
                                <p>Add some delicious items!</p>
                                <button className="browse-btn" onClick={() => navigate('/restaurants')}>
                                    Browse Menu
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="cart-card">
                                    <div className="item-img">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <p className="price">₹{item.price}</p>
                                        <div className="quantity">
                                            <button className="qty-btn minus" onClick={() => handleDecrement(index)}>−</button>
                                            <span>{item.qty}</span>
                                            <button className="qty-btn plus" onClick={() => handleIncrement(index)}>+</button>
                                        </div>
                                    </div>
                                    <div className="item-total">
                                        <p>₹{item.price * item.qty}</p>
                                        <button className="remove-btn" onClick={() => handleRemove(index)}>🗑️</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Items ({totalItems})</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Fee</span>
                                <span className="free-delivery">FREE</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <button className="checkout-btn" onClick={handleCheckout}>
                                Proceed to Checkout • ₹{totalPrice}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Cart;
