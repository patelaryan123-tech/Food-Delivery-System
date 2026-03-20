import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Toast.css';

const ToastNotifications = () => {
    const { toasts, removeToast } = useAuth();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <span className="toast-icon">
                        {toast.type === 'success' ? '✅' :
                         toast.type === 'error' ? '❌' :
                         toast.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={(e) => {
                        e.stopPropagation();
                        removeToast(toast.id);
                    }}>×</button>
                </div>
            ))}
        </div>
    );
};

export default ToastNotifications;
