// Search page component
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchFilters from '../components/location/SearchFilters';
import LocationList from '../components/location/LocationList';
import LocationMap from '../components/location/LocationMap';
import locationService from '../services/locationService';
import type { Location, SearchFilters as SearchFiltersType } from '../types';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFiltersType>(() => {
    const initialFilters: SearchFiltersType = {};
    
    const query = searchParams.get('q');
    if (query) initialFilters.query = query;
    
    const category = searchParams.get('category');
    if (category) initialFilters.category = category as any;
    
    const region = searchParams.get('region');
    if (region) initialFilters.region = region;
    
    const minRating = searchParams.get('minRating');
    if (minRating) initialFilters.minRating = parseFloat(minRating);
    
    const sortBy = searchParams.get('sortBy');
    if (sortBy) initialFilters.sortBy = sortBy as any;
    
    return initialFilters;
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFiltersType) => {
    const params = new URLSearchParams();
    
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.region) params.set('region', newFilters.region);
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'relevance') params.set('sortBy', newFilters.sortBy);
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Could not get user location:', error);
          // Don't show error to user, just continue without location
        }
      );
    }
  }, []);

  // Search function
  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would make an API call with the filters
      const results = await locationService.searchLocations(filters);
      setLocations(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Perform search when filters change or on initial load
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <div className="page-container">
      <div className="location-search-page">
        <div className="search-header">
          <h1>Discover Hidden Gems</h1>
          <p>Find unique, off-the-beaten-path locations recommended by locals</p>
        </div>

        <div className="search-controls">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={performSearch}
            loading={loading}
          />
          
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              🗺️ Map
            </button>
          </div>
        </div>

        <div className="search-results">
          {viewMode === 'list' ? (
            <div className="results-list-view">
              <LocationList
                locations={locations}
                loading={loading}
                error={error}
                showDistance={Boolean(userLocation)}
                userLocation={userLocation || undefined}
                emptyMessage="Try adjusting your search criteria to find more locations"
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
              />
            </div>
          ) : (
            <div className="results-map-view">
              <LocationMap
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                searchFilters={filters}
                onFiltersChange={handleFiltersChange}
                height="calc(100vh - 250px)"
                showControls={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;