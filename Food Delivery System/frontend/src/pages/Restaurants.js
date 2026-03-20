import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RatingStars from '../components/RatingStars';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Restaurants.css';

const menuItems = [
    { id: '1', name: 'Margherita Pizza', price: 199, image: '/images/pizza1.jpg', inStock: true, category: 'pizza' },
    { id: '2', name: 'Cheese Burst Pizza', price: 299, image: '/images/pizza2.jpg', inStock: true, category: 'pizza' },
    { id: '3', name: 'Paneer Tikka Pizza', price: 329, image: '/images/pizza3.jpg', inStock: true, category: 'pizza' },
    { id: '4', name: 'Farmhouse Pizza', price: 349, image: '/images/pizza4.jpg', inStock: true, category: 'pizza' },
    { id: '5', name: 'Veg Burger', price: 129, image: '/images/burger1.jpg', inStock: true, category: 'burger' },
    { id: '6', name: 'Cheese Burger', price: 159, image: '/images/burger2.jpg', inStock: false, category: 'burger' },
    { id: '7', name: 'Paneer Burger', price: 179, image: '/images/burger3.jpg', inStock: true, category: 'burger' },
    { id: '8', name: 'French Fries', price: 99, image: '/images/fries1.jpg', inStock: true, category: 'fries' },
    { id: '9', name: 'Peri Peri Fries', price: 129, image: '/images/fries2.jpg', inStock: true, category: 'fries' },
    { id: '10', name: 'Veg Momos', price: 119, image: '/images/momos1.jpg', inStock: true, category: 'momos' },
    { id: '11', name: 'Fried Momos', price: 149, image: '/images/momos2.jpg', inStock: true, category: 'momos' },
    { id: '12', name: 'Veg Biryani', price: 199, image: '/images/biryani1.jpg', inStock: true, category: 'biryani' },
    { id: '13', name: 'Paneer Biryani', price: 229, image: '/images/biryani2.jpg', inStock: true, category: 'biryani' },
    { id: '14', name: 'Butter Paneer', price: 249, image: '/images/paneer1.jpg', inStock: true, category: 'paneer' },
    { id: '15', name: 'Shahi Paneer', price: 259, image: '/images/paneer2.jpg', inStock: false, category: 'paneer' },
];

const Restaurants = () => {
    const navigate = useNavigate();
    const { user, addToast } = useAuth();
    const [reviews, setReviews] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [addedItems, setAddedItems] = useState({});
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Fetch reviews for all items
        menuItems.forEach(item => {
            fetch(`${API_BASE}/reviews/food/${item.id}`)
                .then(res => res.json())
                .then(data => {
                    setReviews(prev => ({
                        ...prev,
                        [item.id]: data,
                    }));
                })
                .catch(() => {});
        });
    }, []);

    const handleAddToCart = (item) => {
        if (!user) {
            addToast('Please login first 🔐', 'warning');
            navigate('/login');
            return;
        }

        if (!item.inStock) {
            addToast('Item is out of stock ❌', 'error');
            return;
        }

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const exists = cart.find(i => i.id === item.id);

        if (exists) {
            exists.qty++;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
                qty: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        setAddedItems(prev => ({ ...prev, [item.id]: true }));
        addToast(`${item.name} added to cart 🛒`, 'success');

        setTimeout(() => {
            setAddedItems(prev => ({ ...prev, [item.id]: false }));
        }, 1500);
    };

    const handleSubmitReview = async (foodId, foodName) => {
        if (!user) {
            addToast('Please login to review', 'warning');
            return;
        }

        try {
            await fetch(`${API_BASE}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    username: user.username,
                    foodId,
                    foodName,
                    rating: reviewRating,
                    comment: reviewComment,
                }),
            });

            addToast('Review submitted! ⭐', 'success');
            setShowReviewModal(null);
            setReviewComment('');
            setReviewRating(5);

            // Refresh reviews
            const res = await fetch(`${API_BASE}/reviews/food/${foodId}`);
            const data = await res.json();
            setReviews(prev => ({ ...prev, [foodId]: data }));
        } catch (err) {
            addToast('Failed to submit review', 'error');
        }
    };

    const filteredItems = filter === 'all' ?
        menuItems :
        menuItems.filter(i => i.category === filter);

    const categories = ['all', 'pizza', 'burger', 'fries', 'momos', 'biryani', 'paneer'];

    return (
        <>
            <Navbar />
            <section className="vendor-header">
                <div className="vendor-info">
                    <h1>🍽️ Eatify Kitchen</h1>
                    <p>Italian • Fast Food • Indian • ₹200 for one</p>
                    <div className="meta">
                        <span>⭐ 4.5</span>
                        <span>⏱ 30 mins</span>
                        <span>📍 3 km</span>
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <div className="menu-filters">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat === 'all' ? '🍽️ All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <section className="menu-section">
                <div className="menu-list">
                    {filteredItems.map(item => {
                        const itemReview = reviews[item.id];
                        const avgRating = itemReview?.avgRating || 0;
                        const totalReviews = itemReview?.totalReviews || 0;

                        return (
                            <div key={item.id} className={`menu-card ${!item.inStock ? 'out-of-stock' : ''}`}>
                                <div className="menu-img">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        onError={(e) => { e.target.src = `https://loremflickr.com/400/300/${item.category || 'food'}` }}
                                    />
                                    {!item.inStock && <div className="oos-badge">Out of Stock</div>}
                                </div>
                                <div className="menu-text">
                                    <h3>{item.name}</h3>
                                    <p className="price">₹{item.price}</p>

                                    <div className="menu-rating-row">
                                        <RatingStars rating={avgRating} readonly size="small" />
                                        <span className="review-count">({totalReviews})</span>
                                    </div>

                                    <div className="menu-actions">
                                        <button
                                            className={`add-btn ${addedItems[item.id] ? 'added' : ''}`}
                                            disabled={!item.inStock}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            {addedItems[item.id] ? '✓ Added' : 'Add'}
                                        </button>
                                        <button
                                            className="review-btn"
                                            onClick={() => setShowReviewModal(item)}
                                        >
                                            ⭐ Rate
                                        </button>
                                    </div>

                                    {/* Show recent reviews */}
                                    {itemReview?.reviews?.slice(0, 2).map((rev, i) => (
                                        <div key={i} className="mini-review">
                                            <strong>{rev.username}</strong>: {'⭐'.repeat(rev.rating)} {rev.comment}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(null)}>
                    <div className="review-modal" onClick={e => e.stopPropagation()}>
                        <h3>Rate {showReviewModal.name}</h3>
                        <RatingStars rating={reviewRating} onRate={setReviewRating} size="large" />
                        <textarea
                            placeholder="Write your review..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowReviewModal(null)}>Cancel</button>
                            <button className="submit-btn" onClick={() => handleSubmitReview(showReviewModal.id, showReviewModal.name)}>
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default Restaurants;
