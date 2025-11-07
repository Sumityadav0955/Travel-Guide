// LocationCard component for displaying location summaries
import React from 'react';
import { Link } from 'react-router-dom';
import type { Location } from '../../types';

interface LocationCardProps {
  location: Location;
  showDistance?: boolean;
  distance?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  showDistance = false, 
  distance,
  isSelected = false,
  onClick
}) => {
  const formatRating = (rating: number): string => {
    return rating > 0 ? rating.toFixed(1) : 'New';
  };

  const formatReviewCount = (count: number): string => {
    if (count === 0) return 'No reviews yet';
    if (count === 1) return '1 review';
    return `${count} reviews`;
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      'nature': 'Nature & Outdoors',
      'culture': 'Cultural Experience',
      'food': 'Food & Dining',
      'adventure': 'Adventure & Sports',
      'history': 'Historical Site',
      'art': 'Art & Creative',
      'local-life': 'Local Life',
      'hidden-gem': 'Hidden Gem',
    };
    return categoryLabels[category] || category;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div 
      className={`location-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <Link to={`/locations/${location.id}`} className="location-card-link">
        <div className="location-card-image">
          {location.photos.length > 0 ? (
            <img 
              src={location.photos[0].filePath} 
              alt={location.name}
              loading="lazy"
            />
          ) : (
            <div className="location-card-placeholder">
              <span className="placeholder-icon">📍</span>
            </div>
          )}
          <div className="location-card-category">
            {getCategoryLabel(location.category)}
          </div>
          {location.verified && (
            <div className="location-card-verified">
              <span className="verified-icon">✓</span>
            </div>
          )}
        </div>
        
        <div className="location-card-content">
          <div className="location-card-header">
            <h3 className="location-card-title">{location.name}</h3>
            {showDistance && distance !== undefined && (
              <span className="location-card-distance">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>
          
          <p className="location-card-description">
            {location.description.length > 120 
              ? `${location.description.substring(0, 120)}...` 
              : location.description
            }
          </p>
          
          <div className="location-card-specialty">
            <strong>What makes it special:</strong> {' '}
            {location.specialtyDescription.length > 80 
              ? `${location.specialtyDescription.substring(0, 80)}...` 
              : location.specialtyDescription
            }
          </div>
          
          <div className="location-card-footer">
            <div className="location-card-rating">
              <div className="stars">
                {renderStars(location.averageRating)}
              </div>
              <span className="rating-text">
                {formatRating(location.averageRating)} • {formatReviewCount(location.reviewCount)}
              </span>
            </div>
            
            <div className="location-card-meta">
              <span className="location-date">
                Added {new Date(location.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LocationCard;