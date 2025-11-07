// Rating input component for star ratings
import React, { useState } from 'react';

interface RatingInputProps {
  value?: number;
  onChange?: (rating: number) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const RatingInput: React.FC<RatingInputProps> = ({
  value = 0,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
  size = 'medium'
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const getStarSize = () => {
    switch (size) {
      case 'small':
        return '1rem';
      case 'large':
        return '2rem';
      default:
        return '1.5rem';
    }
  };

  const starSize = getStarSize();

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div 
        className={`rating-input ${disabled ? 'disabled' : ''}`}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center'
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              disabled={disabled}
              className="star-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: disabled ? 'default' : 'pointer',
                padding: '0.25rem',
                fontSize: starSize,
                color: isFilled ? '#fbbf24' : '#d1d5db',
                transition: 'color 0.2s',
              }}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          );
        })}
        {value > 0 && (
          <span 
            style={{
              marginLeft: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}
          >
            {value} star{value !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default RatingInput;