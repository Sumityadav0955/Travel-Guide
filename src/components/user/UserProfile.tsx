// UserProfile component for displaying and editing user information
import React, { useState } from 'react';
import type { User } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

interface UserProfileProps {
  user: User;
  isOwnProfile?: boolean;
  onProfileUpdate?: (updatedUser: User) => void;
}

interface ProfileEditData {
  username: string;
  bio: string;
  location: string;
  expertise: string[];
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isOwnProfile = false,
  onProfileUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editData, setEditData] = useState<ProfileEditData>({
    username: user.username,
    bio: user.profile.bio,
    location: user.profile.location,
    expertise: [...user.profile.expertise],
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!editData.username.trim()) {
        throw new Error('Username is required');
      }
      if (!editData.location.trim()) {
        throw new Error('Location is required');
      }

      // Create updated user object
      const updatedUser: User = {
        ...user,
        username: editData.username.trim(),
        profile: {
          ...user.profile,
          bio: editData.bio.trim(),
          location: editData.location.trim(),
          expertise: editData.expertise.filter(exp => exp.trim() !== ''),
        },
      };

      // TODO: Call API to update user profile
      // For now, just call the callback
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // TODO: Implement actual file upload to server
      // For now, create a local URL for preview
      const avatarUrl = URL.createObjectURL(file);
      
      const updatedUser: User = {
        ...user,
        profile: {
          ...user.profile,
          avatar: avatarUrl,
        },
      };

      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExpertiseChange = (value: string) => {
    const expertiseArray = value.split(',').map(item => item.trim()).filter(Boolean);
    setEditData(prev => ({ ...prev, expertise: expertiseArray }));
  };

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(date));
  };

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 1000) return 'Expert';
    if (reputation >= 500) return 'Experienced';
    if (reputation >= 100) return 'Active';
    return 'Newcomer';
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container">
            {user.profile.avatar ? (
              <img 
                src={user.profile.avatar} 
                alt={`${user.username}'s avatar`}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            
            {isOwnProfile && (
              <div className="avatar-upload">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-name">
            <h1>{user.username}</h1>
            <span className="user-type">{user.userType}</span>
          </div>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{user.reputation}</span>
              <span className="stat-label">Reputation</span>
            </div>
            <div className="stat">
              <span className="stat-value">{getReputationLevel(user.reputation)}</span>
              <span className="stat-label">Level</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatJoinDate(user.joinedAt)}</span>
              <span className="stat-label">Joined</span>
            </div>
          </div>

          {isOwnProfile && (
            <div className="profile-actions">
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h3>Location</h3>
          <p>{user.profile.location}</p>
        </div>

        {user.profile.bio && (
          <div className="detail-section">
            <h3>About</h3>
            <p>{user.profile.bio}</p>
          </div>
        )}

        {user.profile.expertise.length > 0 && (
          <div className="detail-section">
            <h3>Areas of Expertise</h3>
            <div className="expertise-tags">
              {user.profile.expertise.map((expertise, index) => (
                <span key={index} className="expertise-tag">
                  {expertise}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Profile"
        >
          <form onSubmit={handleEditSubmit} className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="edit-username">Username</label>
              <Input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-location">Location</label>
              <Input
                type="text"
                placeholder="City, Country"
                value={editData.location}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-bio">Bio</label>
              <textarea
                placeholder="Tell us about yourself..."
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                className="form-textarea"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-expertise">Areas of Expertise</label>
              <Input
                type="text"
                placeholder="e.g., Food, History, Nature (comma-separated)"
                value={editData.expertise.join(', ')}
                onChange={(e) => handleExpertiseChange(e.target.value)}
              />
              <small className="form-hint">
                Separate multiple areas with commas
              </small>
            </div>

            <div className="form-actions">
              <Button type="submit">
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserProfile;