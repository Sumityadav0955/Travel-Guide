// Review moderation component for flagging inappropriate content
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Select from '../common/Select';
import TextArea from '../common/TextArea';
import reviewService from '../../services/reviewService';

interface ReviewModerationProps {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
  onFlagSubmitted?: () => void;
}

const ReviewModeration: React.FC<ReviewModerationProps> = ({
  reviewId,
  isOpen,
  onClose,
  onFlagSubmitted
}) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flagReasons = [
    { value: 'spam', label: 'Spam or promotional content' },
    { value: 'inappropriate', label: 'Inappropriate language or content' },
    { value: 'fake', label: 'Fake or misleading review' },
    { value: 'harassment', label: 'Harassment or personal attacks' },
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'other', label: 'Other (please specify)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for flagging this review');
      return;
    }

    if (reason === 'other' && !customReason.trim()) {
      setError('Please provide a specific reason');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const flagReason = reason === 'other' ? customReason.trim() : reason;
      await reviewService.flagReview(reviewId, flagReason);
      
      if (onFlagSubmitted) {
        onFlagSubmitted();
      }
      
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Flag Review">
      <form onSubmit={handleSubmit}>
        <div className="modal-content">
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
            Help us maintain a safe and helpful community by reporting reviews that violate our guidelines.
          </p>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <Select
            label="Reason for flagging"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={flagReasons}
            required
            disabled={isSubmitting}
          />

          {reason === 'other' && (
            <TextArea
              label="Please specify the reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe why this review should be flagged..."
              required
              disabled={isSubmitting}
              rows={3}
              maxLength={500}
            />
          )}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Flag Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModeration;