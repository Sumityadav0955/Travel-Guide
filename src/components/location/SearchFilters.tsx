// SearchFilters component for location search and filtering
import React, { useState, useCallback } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import type { SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'nature', label: 'Nature & Outdoors' },
  { value: 'culture', label: 'Cultural Experience' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'adventure', label: 'Adventure & Sports' },
  { value: 'history', label: 'Historical Site' },
  { value: 'art', label: 'Art & Creative' },
  { value: 'local-life', label: 'Local Life' },
  { value: 'hidden-gem', label: 'Hidden Gem' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'recency', label: 'Most Recent' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
  { value: '2', label: '2+ Stars' },
  { value: '1', label: '1+ Stars' },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  loading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = useCallback((field: keyof SearchFiltersType) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      [field]: field === 'minRating' ? (value ? parseFloat(value) : undefined) : value || undefined
    });
  }, [filters, onFiltersChange]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  }, [onSearch]);

  const clearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters = Boolean(
    filters.query || 
    filters.category || 
    filters.region || 
    filters.minRating || 
    (filters.sortBy && filters.sortBy !== 'relevance')
  );

  return (
    <div className="search-filters">
      <form onSubmit={handleSearch} className="search-form">
        {/* Main Search Bar */}
        <div className="search-main">
          <div className="search-input-group">
            <Input
              type="text"
              placeholder="Search locations by name or description..."
              value={filters.query || ''}
              onChange={handleInputChange('query')}
              id="search-query"
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={loading}
            >
              {loading ? '🔄' : '🔍'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="advanced-toggle"
          >
            {showAdvanced ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-row">
              <Input
                type="text"
                placeholder="Region or city..."
                value={filters.region || ''}
                onChange={handleInputChange('region')}
                label="Region"
                id="search-region"
              />
              
              <Select
                options={CATEGORY_OPTIONS}
                value={filters.category || ''}
                onChange={handleInputChange('category')}
                label="Category"
                id="search-category"
              />
            </div>
            
            <div className="filter-row">
              <Select
                options={RATING_OPTIONS}
                value={filters.minRating?.toString() || ''}
                onChange={handleInputChange('minRating')}
                label="Minimum Rating"
                id="search-rating"
              />
              
              <Select
                options={SORT_OPTIONS}
                value={filters.sortBy || 'relevance'}
                onChange={handleInputChange('sortBy')}
                label="Sort By"
                id="search-sort"
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="active-filters">
            <div className="active-filters-header">
              <span className="active-filters-label">Active Filters:</span>
              <button
                type="button"
                onClick={clearFilters}
                className="clear-filters-button"
              >
                Clear All
              </button>
            </div>
            
            <div className="filter-tags">
              {filters.query && (
                <span className="filter-tag">
                  Search: "{filters.query}"
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, query: undefined })}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.region && (
                <span className="filter-tag">
                  Region: {filters.region}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, region: undefined })}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.category && (
                <span className="filter-tag">
                  Category: {CATEGORY_OPTIONS.find(opt => opt.value === filters.category)?.label}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, category: undefined })}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.minRating && (
                <span className="filter-tag">
                  {filters.minRating}+ Stars
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, minRating: undefined })}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.sortBy && filters.sortBy !== 'relevance' && (
                <span className="filter-tag">
                  Sort: {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, sortBy: 'relevance' })}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilters;