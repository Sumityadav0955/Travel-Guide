// Rating display component for showing star ratings
import React from 'react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  showCount?: boolean;
  count?: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  showNumber = true,
  showCount = false,
  count,
  size = 'medium',
  className = ''
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.5rem';
      default:
        return '1rem';
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="rating-star" style={{ fontSize: getStarSize() }}>
          ★
        </span>
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="rating-star" style={{ fontSize: getStarSize() }}>
          ★
        </span>
      );
    }
    
    // Empty stars
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="rating-star empty" style={{ fontSize: getStarSize() }}>
          ★
        </span>
      );
    }
    
    return stars;
  };

  const formatRating = (rating: number) => {
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
  };

  return (
    <div className={`rating-display ${className}`}>
      <div className="rating-stars">
        {renderStars()}
      </div>
      {showNumber && (
        <span className="rating-number">
          {formatRating(rating)}
        </span>
      )}
      {showCount && count !== undefined && (
        <span className="rating-count">
          ({count} review{count !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;