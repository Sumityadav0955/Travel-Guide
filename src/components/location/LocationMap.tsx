// Interactive location map with search and filtering
import React, { useState, useEffect, useCallback } from 'react';
import MapWithClustering from '../common/MapWithClustering';
import type { Location, SearchFilters } from '../../types';
import '../../styles/map.css';

interface LocationMapProps {
  locations: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
  searchFilters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
  height?: string;
  showControls?: boolean;
  enableLocationSelection?: boolean;
  onLocationAdd?: (coordinates: { latitude: number; longitude: number }) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  searchFilters = {},
  onFiltersChange,
  height = '500px',
  showControls = true,
  enableLocationSelection = false,
  onLocationAdd
}) => {
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);


  // Center map on selected location
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude]);
      setMapZoom(15);
    }
  }, [selectedLocation]);

  // Filter locations based on search criteria
  useEffect(() => {
    let filtered = [...locations];

    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.description.toLowerCase().includes(query) ||
        location.specialtyDescription.toLowerCase().includes(query)
      );
    }

    if (searchFilters.category) {
      filtered = filtered.filter(location => location.category === searchFilters.category);
    }

    if (searchFilters.minRating) {
      filtered = filtered.filter(location => location.averageRating >= searchFilters.minRating!);
    }

    // Sort locations
    if (searchFilters.sortBy) {
      switch (searchFilters.sortBy) {
        case 'rating':
          filtered.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case 'recency':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'relevance':
        default:
          // Keep current order for relevance
          break;
      }
    }

    setFilteredLocations(filtered);
  }, [locations, searchFilters]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          setMapCenter([coords.latitude, coords.longitude]);
          setMapZoom(12);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  // Handle map click for location selection or area search
  const handleMapClick = useCallback((coordinates: { latitude: number; longitude: number }) => {
    if (enableLocationSelection && onLocationAdd) {
      onLocationAdd(coordinates);
    } else {
      // Center map on clicked location for better exploration
      setMapCenter([coordinates.latitude, coordinates.longitude]);
      setMapZoom(Math.max(mapZoom, 12));
    }
  }, [enableLocationSelection, onLocationAdd, mapZoom]);

  // Handle search input
  const handleSearchChange = useCallback((query: string) => {
    if (onFiltersChange) {
      onFiltersChange({ ...searchFilters, query });
    }
  }, [searchFilters, onFiltersChange]);

  // Handle category filter
  const handleCategoryChange = useCallback((category: string) => {
    if (onFiltersChange) {
      onFiltersChange({ 
        ...searchFilters, 
        category: category === 'all' ? undefined : category as any 
      });
    }
  }, [searchFilters, onFiltersChange]);

  // Handle rating filter
  const handleRatingChange = useCallback((minRating: number) => {
    if (onFiltersChange) {
      onFiltersChange({ 
        ...searchFilters, 
        minRating: minRating === 0 ? undefined : minRating 
      });
    }
  }, [searchFilters, onFiltersChange]);

  // Fit map to show all filtered locations
  const fitToLocations = useCallback(() => {
    if (filteredLocations.length === 0) return;

    if (filteredLocations.length === 1) {
      const location = filteredLocations[0];
      setMapCenter([location.coordinates.latitude, location.coordinates.longitude]);
      setMapZoom(15);
    } else {
      // Calculate bounds for all locations
      const lats = filteredLocations.map(loc => loc.coordinates.latitude);
      const lngs = filteredLocations.map(loc => loc.coordinates.longitude);
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      
      setMapCenter([centerLat, centerLng]);
      setMapZoom(10);
    }
  }, [filteredLocations]);

  return (
    <div className="location-map">
      {showControls && (
        <div className="map-controls-panel">
          <div className="search-controls">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchFilters.query || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="filter-controls">
              <select
                value={searchFilters.category || 'all'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
              >
                <option value="all">All Categories</option>
                <option value="nature">Nature</option>
                <option value="culture">Culture</option>
                <option value="food">Food</option>
                <option value="adventure">Adventure</option>
                <option value="history">History</option>
                <option value="art">Art</option>
                <option value="local-life">Local Life</option>
                <option value="hidden-gem">Hidden Gem</option>
              </select>
              
              <select
                value={searchFilters.minRating || 0}
                onChange={(e) => handleRatingChange(Number(e.target.value))}
                className="form-select"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
              </select>
            </div>
          </div>
          
          <div className="map-action-controls">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn btn-secondary"
              title="Go to my location"
            >
              📍 My Location
            </button>
            
            <button
              type="button"
              onClick={fitToLocations}
              className="btn btn-secondary"
              title="Fit all locations"
              disabled={filteredLocations.length === 0}
            >
              🗺️ Fit All
            </button>
            
            <div className="location-count">
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
      
      <MapWithClustering
        center={mapCenter}
        zoom={mapZoom}
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onLocationSelect={onLocationSelect}
        onMapClick={handleMapClick}
        height={height}
        className="interactive-map"
      />
      
      {enableLocationSelection && (
        <div className="map-help-text">
          <p>💡 Click on the map to add a new location</p>
        </div>
      )}
    </div>
  );
};

export default LocationMap;