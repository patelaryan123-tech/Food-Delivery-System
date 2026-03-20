import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Load user from localStorage
        const savedUser = localStorage.getItem('eatify_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch(e) {
                localStorage.removeItem('eatify_user');
            }
        }

        // Load dark mode preference
        const savedDark = localStorage.getItem('eatify_darkmode');
        if (savedDark === 'true') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('eatify_user', JSON.stringify(userData));
        // Also keep sessionStorage for backward compatibility
        sessionStorage.setItem("user", JSON.stringify({
            username: userData.username,
            isLoggedIn: true
        }));
        addToast('Welcome back! 🎉', 'success');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('eatify_user');
        sessionStorage.removeItem("user");
        addToast('Logged out successfully', 'info');
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newVal = !prev;
            localStorage.setItem('eatify_darkmode', newVal.toString());
            if (newVal) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            return newVal;
        });
    };

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            darkMode,
            toggleDarkMode,
            notifications,
            setNotifications,
            toasts,
            addToast,
            removeToast,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
