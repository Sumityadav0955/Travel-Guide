// Review service for managing review submissions and retrieval
import type { Review, Photo } from '../types';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES, CONTENT_TYPES } from '../constants';
import { api, ApiError } from '../utils/api';

export interface ReviewSubmissionData {
  locationId: string;
  rating: number;
  title: string;
  content: string;
  visitDate: Date;
  photos?: File[];
}

export interface ReviewFilters {
  locationId?: string;
  userId?: string;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful';
}

class ReviewService {
  // Submit a new review
  async submitReview(data: ReviewSubmissionData): Promise<Review> {
    try {
      // Mock implementation - replace with actual API call
      const reviewId = `review_${Date.now()}`;
      
      // Simulate photo upload processing
      const photos: Photo[] = [];
      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) {
          const photo: Photo = {
            id: `photo_${Date.now()}_${i}`,
            entityType: 'review',
            entityId: reviewId,
            filePath: `/uploads/reviews/${reviewId}/photo_${i}.jpg`,
            caption: '',
            uploadDate: new Date(),
          };
          photos.push(photo);
        }
      }

      const review: Review = {
        id: reviewId,
        locationId: data.locationId,
        userId: this.getCurrentUserId(),
        rating: data.rating,
        title: data.title,
        content: data.content,
        photos,
        visitDate: data.visitDate,
        createdAt: new Date(),
        helpfulVotes: 0,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store in localStorage for mock persistence
      this.storeReview(review);

      return review;
    } catch (error) {
      throw new Error('Failed to submit review. Please try again.');
    }
  }

  // Get reviews for a location
  async getLocationReviews(locationId: string, filters?: ReviewFilters): Promise<Review[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const storedReviews = this.getStoredReviews();
      let reviews = storedReviews.filter(review => review.locationId === locationId);

      // Apply filters
      if (filters?.minRating) {
        reviews = reviews.filter(review => review.rating >= filters.minRating!);
      }

      // Apply sorting
      if (filters?.sortBy) {
        reviews = this.sortReviews(reviews, filters.sortBy);
      }

      return reviews;
    } catch (error) {
      throw new Error('Failed to load reviews. Please try again.');
    }
  }

  // Get reviews by user
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const storedReviews = this.getStoredReviews();
      return storedReviews.filter(review => review.userId === userId);
    } catch (error) {
      throw new Error('Failed to load user reviews. Please try again.');
    }
  }

  // Vote on review helpfulness
  async voteHelpful(reviewId: string, helpful: boolean): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const storedReviews = this.getStoredReviews();
      const reviewIndex = storedReviews.findIndex(review => review.id === reviewId);
      
      if (reviewIndex !== -1) {
        if (helpful) {
          storedReviews[reviewIndex].helpfulVotes += 1;
        } else {
          storedReviews[reviewIndex].helpfulVotes = Math.max(0, storedReviews[reviewIndex].helpfulVotes - 1);
        }
        
        localStorage.setItem('reviews_data', JSON.stringify(storedReviews));
      }
    } catch (error) {
      throw new Error('Failed to vote on review. Please try again.');
    }
  }

  // Flag review for moderation
  async flagReview(reviewId: string, reason: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real implementation, this would send the flag to moderation system
      const flagData = {
        reviewId,
        reason,
        flaggedBy: this.getCurrentUserId(),
        flaggedAt: new Date().toISOString()
      };

      // Store flag in localStorage for mock implementation
      const existingFlags = JSON.parse(localStorage.getItem('review_flags') || '[]');
      existingFlags.push(flagData);
      localStorage.setItem('review_flags', JSON.stringify(existingFlags));

    } catch (error) {
      throw new Error('Failed to flag review. Please try again.');
    }
  }

  // Check if user has already voted on a review
  hasUserVoted(reviewId: string): boolean {
    try {
      const userId = this.getCurrentUserId();
      const votes = JSON.parse(localStorage.getItem('review_votes') || '{}');
      return votes[`${reviewId}_${userId}`] === true;
    } catch (error) {
      return false;
    }
  }

  // Record user vote to prevent duplicate voting
  recordUserVote(reviewId: string): void {
    try {
      const userId = this.getCurrentUserId();
      const votes = JSON.parse(localStorage.getItem('review_votes') || '{}');
      votes[`${reviewId}_${userId}`] = true;
      localStorage.setItem('review_votes', JSON.stringify(votes));
    } catch (error) {
      // Silently fail for vote recording
    }
  }

  // Calculate average rating for a location
  async getLocationAverageRating(locationId: string): Promise<{ average: number; count: number }> {
    try {
      const reviews = await this.getLocationReviews(locationId);
      
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = totalRating / reviews.length;

      return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: reviews.length,
      };
    } catch (error) {
      throw new Error('Failed to calculate rating. Please try again.');
    }
  }

  // Validate review data
  validateReviewData(data: Partial<ReviewSubmissionData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.locationId) {
      errors.push('Location is required');
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5 stars');
    }

    if (!data.title || data.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (!data.content || data.content.trim().length < 20) {
      errors.push('Review content must be at least 20 characters long');
    }

    if (!data.visitDate) {
      errors.push('Visit date is required');
    } else if (data.visitDate > new Date()) {
      errors.push('Visit date cannot be in the future');
    }

    if (data.photos && data.photos.length > 10) {
      errors.push('Maximum 10 photos allowed per review');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Private helper methods
  private getCurrentUserId(): string {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    throw new Error('User not authenticated');
  }

  private storeReview(review: Review): void {
    const storedReviews = this.getStoredReviews();
    storedReviews.push(review);
    localStorage.setItem('reviews_data', JSON.stringify(storedReviews));
  }

  private getStoredReviews(): Review[] {
    try {
      const storedData = localStorage.getItem('reviews_data');
      if (storedData) {
        const reviews = JSON.parse(storedData);
        // Convert date strings back to Date objects
        return reviews.map((review: any) => ({
          ...review,
          visitDate: new Date(review.visitDate),
          createdAt: new Date(review.createdAt),
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  private sortReviews(reviews: Review[], sortBy: string): Review[] {
    switch (sortBy) {
      case 'newest':
        return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return reviews.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'rating-high':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return reviews.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      default:
        return reviews;
    }
  }
}

// Export singleton instance
const reviewService = new ReviewService();
export default reviewService;