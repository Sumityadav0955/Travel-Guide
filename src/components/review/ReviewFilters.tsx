// Review filters component for sorting and filtering reviews
import React from 'react';
import Select from '../common/Select';
import RatingInput from '../common/RatingInput';
import type { ReviewFilters } from '../../services/reviewService';

interface ReviewFiltersProps {
  filters: ReviewFilters;
  onFiltersChange: (filters: ReviewFilters) => void;
  showRatingFilter?: boolean;
}

const ReviewFiltersComponent: React.FC<ReviewFiltersProps> = ({
  filters,
  onFiltersChange,
  showRatingFilter = true
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating-high', label: 'Highest Rating' },
    { value: 'rating-low', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' }
  ];

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as ReviewFilters['sortBy']
    });
  };

  const handleMinRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      minRating: rating === 0 ? undefined : rating
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      locationId: filters.locationId,
      userId: filters.userId,
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.minRating !== undefined;

  return (
    <div className="review-filters-container">
      <div className="review-filters">
        <Select
          label="Sort by"
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleSortChange(e.target.value)}
          options={sortOptions}
        />

        {showRatingFilter && (
          <div className="rating-filter">
            <RatingInput
              label="Minimum Rating"
              value={filters.minRating || 0}
              onChange={handleMinRatingChange}
              size="small"
            />
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="filter-actions">
          <button
            onClick={clearFilters}
            className="btn btn-secondary btn-small"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewFiltersComponent;