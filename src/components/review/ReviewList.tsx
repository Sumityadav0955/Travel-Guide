// Review list component with pagination and filtering
import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import RatingDisplay from './RatingDisplay';
import ReviewFiltersComponent from './ReviewFilters';
import reviewService, { type ReviewFilters } from '../../services/reviewService';
import type { Review, User } from '../../types';

interface ReviewListProps {
  locationId?: string;
  userId?: string;
  title?: string;
  showAggregateRating?: boolean;
  itemsPerPage?: number;
}

interface AggregateRating {
  average: number;
  count: number;
}

const ReviewList: React.FC<ReviewListProps> = ({
  locationId,
  userId,
  title = 'Reviews',
  showAggregateRating = true,
  itemsPerPage = 10
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [aggregateRating, setAggregateRating] = useState<AggregateRating>({ average: 0, count: 0 });
  
  const [filters, setFilters] = useState<ReviewFilters>({
    locationId,
    userId,
    sortBy: 'newest'
  });



  useEffect(() => {
    loadReviews();
  }, [filters, locationId, userId]);

  useEffect(() => {
    if (locationId && showAggregateRating) {
      loadAggregateRating();
    }
  }, [locationId, showAggregateRating]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      let reviewsData: Review[];
      
      if (locationId) {
        reviewsData = await reviewService.getLocationReviews(locationId, filters);
      } else if (userId) {
        reviewsData = await reviewService.getUserReviews(userId);
      } else {
        reviewsData = [];
      }

      setReviews(reviewsData);
      
      // Load user data for reviews (mock implementation)
      const userIds = [...new Set(reviewsData.map(review => review.userId))];
      const usersData: Record<string, User> = {};
      
      // In a real app, this would be a batch API call
      userIds.forEach(userId => {
        usersData[userId] = {
          id: userId,
          username: `User ${userId.slice(-4)}`,
          email: `user${userId.slice(-4)}@example.com`,
          userType: 'traveler',
          profile: {
            bio: '',
            location: '',
            expertise: []
          },
          reputation: 0,
          joinedAt: new Date()
        };
      });
      
      setUsers(usersData);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadAggregateRating = async () => {
    if (!locationId) return;
    
    try {
      const rating = await reviewService.getLocationAverageRating(locationId);
      setAggregateRating(rating);
    } catch (err) {
      console.error('Failed to load aggregate rating:', err);
    }
  };

  const handleFiltersChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
  };

  const handleHelpfulVote = (reviewId: string, helpful: boolean) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulVotes: review.helpfulVotes + (helpful ? 1 : 0) }
          : review
      )
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of review list
    document.querySelector('.review-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="review-list">
        <div className="review-loading">
          Loading reviews...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-list">
        <div className="form-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="review-list">
      {showAggregateRating && aggregateRating.count > 0 && (
        <div className="aggregate-rating">
          <div className="aggregate-rating-score">
            {aggregateRating.average.toFixed(1)}
          </div>
          <div className="aggregate-rating-stars">
            <RatingDisplay 
              rating={aggregateRating.average}
              showNumber={false}
              size="large"
            />
          </div>
          <div className="aggregate-rating-text">
            Based on {aggregateRating.count} review{aggregateRating.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="review-list-header">
        <div>
          <h3 className="review-list-title">{title}</h3>
          <p className="review-count">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {reviews.length > 0 && (
          <ReviewFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            showRatingFilter={!!locationId}
          />
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="review-empty">
          <h3>No reviews yet</h3>
          <p>Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          <div className="review-cards">
            {currentReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                user={users[review.userId]}
                onHelpfulVote={handleHelpfulVote}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;