// Review submission form component
import React, { useState } from 'react';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import RatingInput from '../common/RatingInput';
import reviewService, { type ReviewSubmissionData } from '../../services/reviewService';
import type { Review } from '../../types';

interface ReviewFormProps {
  locationId: string;
  locationName: string;
  onSubmitSuccess?: (review: Review) => void;
  onCancel?: () => void;
}

interface FormData {
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  photos: File[];
}

interface FormErrors {
  rating?: string;
  title?: string;
  content?: string;
  visitDate?: string;
  photos?: string;
  general?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  locationId,
  locationName,
  onSubmitSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    rating: 0,
    title: '',
    content: '',
    visitDate: '',
    photos: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Photo handling will be implemented in media task
  // const handlePhotosChange = (files: File[]) => {
  //   handleInputChange('photos', files);
  // };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Review content is required';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Review content must be at least 20 characters long';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    } else {
      const visitDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (visitDate > today) {
        newErrors.visitDate = 'Visit date cannot be in the future';
      }
    }

    if (formData.photos.length > 10) {
      newErrors.photos = 'Maximum 10 photos allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submissionData: ReviewSubmissionData = {
        locationId,
        rating: formData.rating,
        title: formData.title.trim(),
        content: formData.content.trim(),
        visitDate: new Date(formData.visitDate),
        photos: formData.photos
      };

      const review = await reviewService.submitReview(submissionData);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(review);
      }

      // Reset form
      setFormData({
        rating: 0,
        title: '',
        content: '',
        visitDate: '',
        photos: []
      });

    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to submit review'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get max date (today) for visit date input
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="review-form-container">
      <div className="form-header">
        <h2>Write a Review</h2>
        <p>Share your experience at {locationName}</p>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        {errors.general && (
          <div className="form-error">
            {errors.general}
          </div>
        )}

        <RatingInput
          label="Overall Rating"
          value={formData.rating}
          onChange={(rating) => handleInputChange('rating', rating)}
          required
          error={errors.rating}
          disabled={isSubmitting}
        />

        <Input
          type="text"
          label="Review Title"
          placeholder="Summarize your experience in a few words"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
          error={errors.title}
          disabled={isSubmitting}

        />

        <TextArea
          label="Your Experience"
          placeholder="Tell us about your visit. What made this place special? What should other travelers know?"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          required
          error={errors.content}
          disabled={isSubmitting}
          rows={6}
          maxLength={2000}
        />

        <Input
          type="date"
          label="Visit Date"
          value={formData.visitDate}
          onChange={(e) => handleInputChange('visitDate', e.target.value)}
          required
          error={errors.visitDate}
          disabled={isSubmitting}
          max={getMaxDate()}
        />

        <div className="input-group">
          <label className="input-label">
            Photos (Optional)
          </label>
          <div className="photo-upload-placeholder">
            <p>Photo upload functionality will be implemented in the media handling task</p>
          </div>
          {errors.photos && <span className="input-error">{errors.photos}</span>}
          <div className="photo-help-text">
            Add up to 10 photos to help other travelers visualize your experience
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;