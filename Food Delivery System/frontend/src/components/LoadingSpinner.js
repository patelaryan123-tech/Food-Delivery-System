import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ text = 'Loading...' }) => {
    return (
        <div className="spinner-overlay">
            <div className="spinner-container">
                <div className="spinner-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p className="spinner-text">{text}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
