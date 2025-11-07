// LocationList component for displaying location search results
import React from 'react';
import LocationCard from './LocationCard';
import type { Location } from '../../types';

interface LocationListProps {
  locations: Location[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  showDistance?: boolean;
  userLocation?: { latitude: number; longitude: number };
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

const LocationList: React.FC<LocationListProps> = ({
  locations,
  loading = false,
  error = null,
  emptyMessage = 'No locations found',
  showDistance = false,
  userLocation,
  selectedLocation,
  onLocationSelect
}) => {
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="location-list-loading">
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="location-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-rating"></div>
                  <div className="skeleton-date"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-list-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Unable to Load Locations</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="location-list-empty">
        <div className="empty-content">
          <span className="empty-icon">🗺️</span>
          <h3>No Locations Found</h3>
          <p>{emptyMessage}</p>
          <div className="empty-suggestions">
            <p>Try:</p>
            <ul>
              <li>Adjusting your search terms</li>
              <li>Removing some filters</li>
              <li>Searching in a different region</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="location-list">
      <div className="location-list-header">
        <p className="results-count">
          {locations.length} location{locations.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="location-grid">
        {locations.map((location) => {
          let distance: number | undefined;
          
          if (showDistance && userLocation) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              location.coordinates.latitude,
              location.coordinates.longitude
            );
          }
          
          return (
            <LocationCard
              key={location.id}
              location={location}
              showDistance={showDistance}
              distance={distance}
              isSelected={selectedLocation?.id === location.id}
              onClick={() => onLocationSelect?.(location)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LocationList;