import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import '../styles/Home.css';

const restaurantsData = [
    { id: 1, name: 'Pizza Palace', category: 'pizza', image: '/images/pizza.jpg', cuisine: 'Italian • Fast Food', rating: 4.5, time: '30 mins' },
    { id: 2, name: 'Burger Town', category: 'burger', image: '/images/burger.jpg', cuisine: 'American • Fast Food', rating: 4.6, time: '20 mins' },
    { id: 3, name: 'Chinese Hub', category: 'chinese', image: '/images/chinese.jpg', cuisine: 'Indian • Mughlai', rating: 4.3, time: '25 mins' },
    { id: 4, name: 'Green Bowl', category: 'healthy', image: '/images/healthy.jpg', cuisine: 'Salads • Vegan • Healthy', rating: 4.7, time: '18 mins' },
    { id: 5, name: 'Sweet Delight', category: 'desserts', image: '/images/dessert.jpg', cuisine: 'Cakes • Ice Cream • Desserts', rating: 4.8, time: '22 mins' },
];

const popularItems = [
    { id: 1, name: 'Cheese Burst Pizza', price: 299, image: '/images/pizza2.jpg', category: 'pizza', orders: 1250 },
    { id: 2, name: 'Paneer Biryani', price: 229, image: '/images/biryani2.jpg', category: 'biryani', orders: 980 },
    { id: 3, name: 'French Fries', price: 99, image: '/images/fries1.jpg', category: 'fries', orders: 1580 },
    { id: 4, name: 'Veg Momos', price: 119, image: '/images/momos1.jpg', category: 'momos', orders: 870 },
];

const Home = () => {
    const [currentCategory, setCurrentCategory] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [trending, setTrending] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const categories = [
        { id: 'all', label: 'All', icon: '🍽️' },
        { id: 'pizza', label: 'Pizza', icon: '🍕' },
        { id: 'burger', label: 'Burger', icon: '🍔' },
        { id: 'chinese', label: 'Chinese', icon: '🍜' },
        { id: 'healthy', label: 'Healthy', icon: '🥗' },
        { id: 'desserts', label: 'Desserts', icon: '🍰' },
    ];

    useEffect(() => {
        // Smart recommendations based on previous orders
        if (user) {
            const savedUser = localStorage.getItem('eatify_user');
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    if (userData.previousOrders && userData.previousOrders.length > 0) {
                        const topCategories = userData.previousOrders
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 3)
                            .map(o => o.category);
                        
                        const recs = popularItems.filter(i =>
                            topCategories.includes(i.category)
                        );
                        setRecommendations(recs.length > 0 ? recs : popularItems);
                    } else {
                        setRecommendations(popularItems);
                    }
                } catch(e) {
                    setRecommendations(popularItems);
                }
            }
        } else {
            setRecommendations(popularItems);
        }
    }, [user]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch(`${API_BASE}/food/trending`);
                const data = await res.json();
                setTrending(data);
            } catch(e) {}
        };
        fetchTrending();
    }, []);

    const filteredRestaurants = restaurantsData.filter(restaurant => {
        const matchCategory = currentCategory === 'all' || restaurant.category === currentCategory;
        const matchSearch = restaurant.name.toLowerCase().includes(searchText.toLowerCase());
        return matchCategory && matchSearch;
    });

    const startVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice search is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchText(transcript);
        };

        recognition.start();
    };

    return (
        <>
            <Navbar />
            <section className="hero">
                <div className="hero-content">
                    <h1>Delicious Food,<br /><span>Delivered Fast</span></h1>
                    <p>Order from 1000+ restaurants near you</p>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search for restaurant or dish..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button className={`voice-btn ${isListening ? 'listening' : ''}`} onClick={startVoiceSearch} title="Voice Search">
                            {isListening ? '⏺️' : '🎤'}
                        </button>
                        <button>Search</button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat"><strong>1000+</strong><span>Restaurants</span></div>
                        <div className="stat"><strong>500+</strong><span>Menu Items</span></div>
                        <div className="stat"><strong>30 min</strong><span>Avg. Delivery</span></div>
                    </div>
                </div>

                <div className="hero-illustration">
                    <div className="floating-card card-1">🍕</div>
                    <div className="floating-card card-2">🍔</div>
                    <div className="floating-card card-3">🍛</div>
                    <div className="floating-card card-4">🥗</div>
                </div>
            </section>

            <section className="categories">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category ${currentCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setCurrentCategory(cat.id)}
                    >
                        <span className="cat-icon">{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </section>

            {/* SMART RECOMMENDATIONS */}
            {recommendations.length > 0 && (
                <section className="recommendations">
                    <h2>🤖 {user ? 'Recommended for You' : 'Popular Right Now'}</h2>
                    <div className="rec-grid">
                        {recommendations.map(item => (
                            <div key={item.id} className="rec-card" onClick={() => navigate('/restaurants')}>
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    onError={(e) => { e.target.src = `https://loremflickr.com/400/300/${item.category || 'food'}` }}
                                />
                                <div className="rec-info">
                                    <h4>{item.name}</h4>
                                    <p>₹{item.price}</p>
                                    <span className="rec-orders">🔥 {item.orders}+ orders</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* AI MOOD PICKER - MOST ADVANCED FEATURE */}
            <section className="mood-ai-section">
                <div className="mood-ai-card">
                    <div className="mood-ai-content">
                        <h2>🤖 Eatify Intelligence™</h2>
                        <p>Not sure what to eat? Let our AI decide based on your mood!</p>
                        <div className="mood-btns">
                            <button onClick={() => navigate('/restaurants')}>😋 Hungry</button>
                            <button onClick={() => navigate('/restaurants')}>🥗 Healthy</button>
                            <button onClick={() => navigate('/restaurants')}>🌶️ Spicy</button>
                            <button onClick={() => navigate('/restaurants')}>🍦 Sweet</button>
                            <button className="surprise-btn" onClick={() => navigate('/restaurants')}>✨ Surprise Me!</button>
                        </div>
                    </div>
                    <div className="mood-ai-visual">
                        <div className="ai-brain-icon">🧠</div>
                    </div>
                </div>
            </section>

            {/* TRENDING NOW */}
            {trending.length > 0 && (
                <section className="trending-now">
                    <h2>📈 Trending Now</h2>
                    <div className="trending-scroll">
                        {trending.map(item => (
                            <div key={item._id} className="trending-item" onClick={() => navigate('/restaurants')}>
                                <img src={item.image} alt={item.name} />
                                <div className="trending-overlay">
                                    <span>#{trending.indexOf(item) + 1}</span>
                                    <h4>{item.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="restaurants">
                <h2>Popular Restaurants</h2>
                <div className="restaurant-grid">
                    {filteredRestaurants.map(restaurant => (
                            <div key={restaurant.id} className="restaurant-card" onClick={() => navigate('/restaurants')}>
                                <img 
                                    src={restaurant.image} 
                                    alt={restaurant.name} 
                                    onError={(e) => { e.target.src = `https://loremflickr.com/400/300/${restaurant.category || 'restaurant'}` }}
                                />
                            <div className="card-info">
                                <h3>{restaurant.name}</h3>
                                <p>{restaurant.cuisine}</p>
                                <div className="rating">⭐ {restaurant.rating} <span>{restaurant.time}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* OFFERS BANNER */}
            <section className="offers-banner">
                <div className="offer-card">
                    <div className="offer-content">
                        <h3>🎉 First Order Special</h3>
                        <p>Get <strong>50% OFF</strong> on your first order!</p>
                        <span className="coupon-code">WELCOME50</span>
                    </div>
                </div>
                <div className="offer-card">
                    <div className="offer-content">
                        <h3>🔥 Weekend Deal</h3>
                        <p>Flat <strong>₹100 OFF</strong> on orders above ₹500</p>
                        <span className="coupon-code">FLAT100</span>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Home;
