// Location submission form component
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Select from '../common/Select';
import MapPicker from '../common/MapPicker';
import locationService, { type LocationSubmissionData } from '../../services/locationService';
import { useAuth } from '../../context/AuthContext';
import type { LocationCategory } from '../../types';

interface FormData {
  name: string;
  description: string;
  specialtyDescription: string;
  category: LocationCategory | '';
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  specialtyDescription?: string;
  category?: string;
  coordinates?: string;
  submit?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'nature', label: 'Nature & Outdoors' },
  { value: 'culture', label: 'Cultural Experience' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'adventure', label: 'Adventure & Sports' },
  { value: 'history', label: 'Historical Site' },
  { value: 'art', label: 'Art & Creative' },
  { value: 'local-life', label: 'Local Life' },
  { value: 'hidden-gem', label: 'Hidden Gem' },
];

const LocationSubmissionForm: React.FC = () => {
  const navigate = useNavigate();
  const { state: { user } } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    specialtyDescription: '',
    category: '',
    coordinates: null,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Location name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    // Specialty description validation
    if (!formData.specialtyDescription.trim()) {
      newErrors.specialtyDescription = 'Please explain what makes this location special';
    } else if (formData.specialtyDescription.length < 30) {
      newErrors.specialtyDescription = 'Specialty description must be at least 30 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Coordinates validation
    if (!formData.coordinates) {
      newErrors.coordinates = 'Please select a location on the map';
    } else if (!locationService.validateCoordinates(
      formData.coordinates.latitude,
      formData.coordinates.longitude
    )) {
      newErrors.coordinates = 'Invalid coordinates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleCoordinatesChange = useCallback((coordinates: { latitude: number; longitude: number }) => {
    setFormData(prev => ({
      ...prev,
      coordinates
    }));
    
    // Clear coordinates error
    if (errors.coordinates) {
      setErrors(prev => ({
        ...prev,
        coordinates: undefined
      }));
    }
  }, [errors.coordinates]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user || (user.userType !== 'local' && user.userType !== 'both')) {
      setErrors({ submit: 'Only local users can submit location recommendations' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submissionData: LocationSubmissionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        specialtyDescription: formData.specialtyDescription.trim(),
        category: formData.category as LocationCategory,
        coordinates: formData.coordinates!,
      };

      await locationService.submitLocation(submissionData);
      
      // Navigate to the location detail page or dashboard
      navigate('/dashboard', { 
        state: { 
          message: 'Location submitted successfully! It will be reviewed before being published.' 
        }
      });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit location'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, validateForm, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="location-submission-form">
      <div className="form-header">
        <h1>Recommend a Hidden Gem</h1>
        <p>Share a special place that travelers should discover</p>
      </div>

      <form onSubmit={handleSubmit} className="submission-form">
        <Input
          id="name"
          name="name"
          label="Location Name"
          placeholder="Enter the name of this location"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          error={errors.name}
        />

        <TextArea
          id="description"
          name="description"
          label="Description"
          placeholder="Describe this location - what can visitors expect to see and do here?"
          value={formData.description}
          onChange={handleInputChange('description')}
          required
          rows={4}
          maxLength={500}
          error={errors.description}
        />

        <TextArea
          id="specialtyDescription"
          name="specialtyDescription"
          label="What Makes It Special?"
          placeholder="Explain why this location is unique and off-the-beaten-path. What makes it worth visiting?"
          value={formData.specialtyDescription}
          onChange={handleInputChange('specialtyDescription')}
          required
          rows={4}
          maxLength={300}
          error={errors.specialtyDescription}
        />

        <Select
          id="category"
          name="category"
          label="Category"
          options={CATEGORY_OPTIONS}
          value={formData.category}
          onChange={handleInputChange('category')}
          required
          error={errors.category}
          placeholder="Select the best category for this location"
        />

        <MapPicker
          label="Location on Map"
          coordinates={formData.coordinates || undefined}
          onCoordinatesChange={handleCoordinatesChange}
          error={errors.coordinates}
        />

        {errors.submit && (
          <div className="form-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
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
            {isSubmitting ? 'Submitting...' : 'Submit Location'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationSubmissionForm;