// Location detail page component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhotoGallery } from '../components/media';
import Map from '../components/common/Map';
import locationService from '../services/locationService';
import type { Location } from '../types';

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!id) {
        setError('Location ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const locationData = await locationService.getLocationById(id);
        
        if (!locationData) {
          setError('Location not found');
        } else {
          setLocation(locationData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load location');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

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

  const formatRating = (rating: number): string => {
    return rating > 0 ? rating.toFixed(1) : 'New';
  };

  const formatReviewCount = (count: number): string => {
    if (count === 0) return 'No reviews yet';
    if (count === 1) return '1 review';
    return `${count} reviews`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading location details...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h1>Location Not Found</h1>
          <p>{error || 'The requested location could not be found.'}</p>
          <button 
            onClick={() => navigate('/locations')} 
            className="btn btn-primary"
          >
            Browse Locations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="location-detail">
        {/* Header Section */}
        <div className="location-header">
          <div className="location-breadcrumb">
            <button 
              onClick={() => navigate(-1)} 
              className="back-button"
            >
              ← Back
            </button>
          </div>
          
          <div className="location-title-section">
            <div className="location-title-row">
              <h1 className="location-title">{location.name}</h1>
              {location.verified && (
                <span className="verified-badge">
                  <span className="verified-icon">✓</span>
                  Verified
                </span>
              )}
            </div>
            
            <div className="location-meta">
              <span className="location-category">
                {getCategoryLabel(location.category)}
              </span>
              <span className="location-coordinates">
                {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="location-photos">
          <PhotoGallery 
            photos={location.photos} 
            title="Photos"
            maxVisible={8}
          />
        </div>

        {/* Main Content */}
        <div className="location-content">
          <div className="location-main">
            {/* Description */}
            <section className="location-section">
              <h2>About This Location</h2>
              <p className="location-description">{location.description}</p>
            </section>

            {/* What Makes It Special */}
            <section className="location-section">
              <h2>What Makes It Special</h2>
              <p className="location-specialty">{location.specialtyDescription}</p>
            </section>

            {/* Reviews Section Placeholder */}
            <section className="location-section">
              <h2>Reviews & Experiences</h2>
              <div className="reviews-placeholder">
                <p>Reviews will be displayed here when the review system is implemented.</p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="location-sidebar">
            {/* Rating Summary */}
            <div className="rating-summary">
              <h3>Rating & Reviews</h3>
              <div className="rating-display">
                <div className="rating-score">
                  {formatRating(location.averageRating)}
                </div>
                <div className="rating-details">
                  <div className="stars">
                    {renderStars(location.averageRating)}
                  </div>
                  <p className="review-count">{formatReviewCount(location.reviewCount)}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="location-info">
              <h3>Location Details</h3>
              <div className="info-item">
                <strong>Category:</strong> {getCategoryLabel(location.category)}
              </div>
              <div className="info-item">
                <strong>Added:</strong> {new Date(location.createdAt).toLocaleDateString()}
              </div>
              <div className="info-item">
                <strong>Status:</strong> {location.verified ? 'Verified' : 'Pending Verification'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="location-actions">
              <button className="btn btn-primary btn-full">
                Write a Review
              </button>
              <button className="btn btn-secondary btn-full">
                Save to Wishlist
              </button>
              <button className="btn btn-secondary btn-full">
                Share Location
              </button>
            </div>

            {/* Location Map */}
            <div className="location-map-section">
              <h3>Location on Map</h3>
              <div className="map-container-detail">
                <Map
                  key={location.id}
                  center={[location.coordinates.latitude, location.coordinates.longitude]}
                  zoom={15}
                  locations={[location]}
                  height="300px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;