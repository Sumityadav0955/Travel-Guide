// Review card component for displaying individual reviews
import React, { useState, useEffect } from 'react';
import RatingDisplay from './RatingDisplay';
import ReviewModeration from './ReviewModeration';
import { PhotoGallery } from '../media';
import reviewService from '../../services/reviewService';
import type { Review, User } from '../../types';

interface ReviewCardProps {
  review: Review;
  user?: User; // User who wrote the review
  onHelpfulVote?: (reviewId: string, helpful: boolean) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  user,
  onHelpfulVote
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  useEffect(() => {
    // Check if user has already voted on this review
    setHasVoted(reviewService.hasUserVoted(review.id));
  }, [review.id]);

  const handleHelpfulVote = async (helpful: boolean) => {
    if (isVoting || hasVoted) return;

    setIsVoting(true);
    try {
      await reviewService.voteHelpful(review.id, helpful);
      reviewService.recordUserVote(review.id);
      setHasVoted(true);
      
      if (onHelpfulVote) {
        onHelpfulVote(review.id, helpful);
      }
    } catch (error) {
      console.error('Failed to vote on review:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleFlagReview = () => {
    setShowModerationModal(true);
  };

  const handleFlagSubmitted = () => {
    setIsFlagged(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatVisitDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(date);
  };

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-user-info">
          <div className="review-avatar">
            {user?.profile?.avatar ? (
              <img 
                src={user.profile.avatar} 
                alt={user.username}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              getUserInitials(user?.username || 'Anonymous')
            )}
          </div>
          <div className="review-user-details">
            <h4>{user?.username || 'Anonymous'}</h4>
            <p>Visited {formatVisitDate(review.visitDate)}</p>
          </div>
        </div>
        <div className="review-rating-date">
          <div className="review-rating">
            <RatingDisplay 
              rating={review.rating} 
              showNumber={true}
              size="small"
            />
          </div>
          <div className="review-date">
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>

      <div className="review-content">
        <h3>{review.title}</h3>
        <p>{review.content}</p>
      </div>

      {review.photos && review.photos.length > 0 && (
        <div className="review-photos">
          <PhotoGallery 
            photos={review.photos}
            maxVisible={4}
          />
        </div>
      )}

      <div className="review-actions">
        <div className="review-helpful">
          <button
            onClick={() => handleHelpfulVote(true)}
            disabled={isVoting || hasVoted}
            className={`helpful-button ${hasVoted ? 'voted' : ''}`}
          >
            👍 Helpful
          </button>
          {review.helpfulVotes > 0 && (
            <span className="helpful-count">
              {review.helpfulVotes} found this helpful
            </span>
          )}
        </div>
        
        <div className="review-moderation">
          {!isFlagged ? (
            <button
              onClick={handleFlagReview}
              className="flag-button"
              title="Flag this review"
            >
              🚩 Flag
            </button>
          ) : (
            <span className="flagged-indicator">
              ⚠️ Flagged for review
            </span>
          )}
        </div>
      </div>

      <ReviewModeration
        reviewId={review.id}
        isOpen={showModerationModal}
        onClose={() => setShowModerationModal(false)}
        onFlagSubmitted={handleFlagSubmitted}
      />
    </div>
  );
};

export default ReviewCard;