import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ToastNotifications from './components/ToastNotifications';
import Chatbot from './components/Chatbot';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Restaurants from './pages/Restaurants';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Delivery from './pages/Delivery';
import Bill from './pages/Bill';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import DeliveryPartner from './pages/DeliveryPartner';
import ReferAndEarn from './pages/ReferAndEarn';
import PlusSubscription from './pages/PlusSubscription';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/vendor" element={<Restaurants />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/delivery-panel" element={<DeliveryPartner />} />
          <Route path="/refer" element={<ReferAndEarn />} />
          <Route path="/plus" element={<PlusSubscription />} />
        </Routes>
        <Chatbot />
        <ToastNotifications />
      </Router>
    </AuthProvider>
  );
}

export default App;
