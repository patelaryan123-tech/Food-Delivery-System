import React, { useState } from 'react';
import '../styles/RatingStars.css';

const RatingStars = ({ rating = 0, onRate, readonly = false, size = 'medium' }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className={`rating-stars ${size}`}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    className={`star ${star <= (hover || rating) ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
                    onClick={() => !readonly && onRate && onRate(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                >
                    ★
                </span>
            ))}
            {rating > 0 && <span className="rating-value">{rating.toFixed(1)}</span>}
        </div>
    );
};

export default RatingStars;
