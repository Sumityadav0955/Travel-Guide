// UserDashboard component for displaying user's activity and saved content
import React, { useState, useEffect } from 'react';
import type { User, Location, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Loading from '../common/Loading';
import UserMessaging from './UserMessaging';
import UserFollowing from './UserFollowing';
import ReputationDisplay from './ReputationDisplay';
import { useMessaging } from '../../hooks/useMessaging';
import { useCommunity } from '../../hooks/useCommunity';
import messagingService from '../../services/messagingService';

interface DashboardStats {
  locationsSubmitted: number;
  reviewsWritten: number;
  savedLocations: number;
  totalHelpfulVotes: number;
}

interface UserActivity {
  type: 'location' | 'review' | 'follow';
  title: string;
  description: string;
  date: Date;
  id: string;
}

interface UserDashboardProps {
  user?: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user: propUser }) => {
  const { state } = useAuth();
  const user = propUser || state.user;
  const { unreadCount } = useMessaging();
  const { followCounts } = useCommunity();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'reviews' | 'saved' | 'messages' | 'community'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    locationsSubmitted: 0,
    reviewsWritten: 0,
    savedLocations: 0,
    totalHelpfulVotes: 0,
  });
  const [submittedLocations, setSubmittedLocations] = useState<Location[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // For now, using mock data
      
      // Mock stats
      setStats({
        locationsSubmitted: 12,
        reviewsWritten: 8,
        savedLocations: 25,
        totalHelpfulVotes: 47,
      });

      // Mock submitted locations
      const mockSubmittedLocations: Location[] = [
        {
          id: '1',
          name: 'Hidden Waterfall Trail',
          description: 'A secret waterfall accessible only by locals',
          specialtyDescription: 'This trail is known only to residents and offers stunning views',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          category: 'nature',
          submittedBy: user!.id,
          photos: [],
          averageRating: 4.8,
          reviewCount: 6,
          createdAt: new Date('2024-01-15'),
          verified: true,
        },
        {
          id: '2',
          name: 'Local Artisan Market',
          description: 'Weekly market featuring local craftspeople',
          specialtyDescription: 'Every Saturday, local artists gather here',
          coordinates: { latitude: 40.7589, longitude: -73.9851 },
          category: 'culture',
          submittedBy: user!.id,
          photos: [],
          averageRating: 4.5,
          reviewCount: 3,
          createdAt: new Date('2024-02-01'),
          verified: true,
        },
      ];
      setSubmittedLocations(mockSubmittedLocations);

      // Mock user reviews
      const mockReviews: Review[] = [
        {
          id: '1',
          locationId: '3',
          userId: user!.id,
          rating: 5,
          title: 'Amazing hidden gem!',
          content: 'This place exceeded all expectations. The local guide was fantastic.',
          photos: [],
          visitDate: new Date('2024-01-20'),
          createdAt: new Date('2024-01-22'),
          helpfulVotes: 12,
        },
        {
          id: '2',
          locationId: '4',
          userId: user!.id,
          rating: 4,
          title: 'Great local experience',
          content: 'Authentic food and friendly locals. Highly recommended!',
          photos: [],
          visitDate: new Date('2024-02-10'),
          createdAt: new Date('2024-02-12'),
          helpfulVotes: 8,
        },
      ];
      setUserReviews(mockReviews);

      // Mock saved locations
      const mockSavedLocations: Location[] = [
        {
          id: '5',
          name: 'Secret Beach Cove',
          description: 'Pristine beach known only to locals',
          specialtyDescription: 'Accessible only during low tide',
          coordinates: { latitude: 36.7783, longitude: -119.4179 },
          category: 'nature',
          submittedBy: 'other-user',
          photos: [],
          averageRating: 4.9,
          reviewCount: 15,
          createdAt: new Date('2024-01-10'),
          verified: true,
        },
      ];
      setSavedLocations(mockSavedLocations);

      // Mock recent activity
      const mockActivity: UserActivity[] = [
        {
          type: 'review',
          title: 'Reviewed "Mountain View Cafe"',
          description: 'Left a 5-star review with photos',
          date: new Date('2024-02-15'),
          id: 'activity-1',
        },
        {
          type: 'location',
          title: 'Added "Local Artisan Market"',
          description: 'Shared a new hidden gem location',
          date: new Date('2024-02-01'),
          id: 'activity-2',
        },
      ];
      setRecentActivity(mockActivity);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromSaved = (locationId: string) => {
    setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
    setStats(prev => ({ ...prev, savedLocations: prev.savedLocations - 1 }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (!user) {
    return (
      <div className="dashboard-error">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.username}!</h1>
        <p className="dashboard-subtitle">Here's what's happening with your travel community</p>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.locationsSubmitted}</div>
          <div className="stat-label">Locations Shared</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.reviewsWritten}</div>
          <div className="stat-label">Reviews Written</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.savedLocations}</div>
          <div className="stat-label">Saved Locations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalHelpfulVotes}</div>
          <div className="stat-label">Helpful Votes</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          My Locations ({submittedLocations.length})
        </button>
        <button
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          My Reviews ({userReviews.length})
        </button>
        <button
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved ({savedLocations.length})
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community ({followCounts.following + followCounts.followers})
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'location' && '📍'}
                        {activity.type === 'review' && '⭐'}
                        {activity.type === 'follow' && '👥'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-description">{activity.description}</div>
                        <div className="activity-date">{formatDate(activity.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="locations-tab">
            <div className="tab-header">
              <h3>Locations You've Shared</h3>
              <Button onClick={() => window.location.href = '/submit-location'}>
                Add New Location
              </Button>
            </div>
            {submittedLocations.length > 0 ? (
              <div className="location-grid">
                {submittedLocations.map((location) => (
                  <div key={location.id} className="location-card">
                    <div className="location-header">
                      <h4>{location.name}</h4>
                      <span className="location-category">{location.category}</span>
                    </div>
                    <p className="location-description">{location.description}</p>
                    <div className="location-stats">
                      <div className="rating">
                        {renderStars(Math.round(location.averageRating))}
                        <span>{location.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="review-count">{location.reviewCount} reviews</div>
                    </div>
                    <div className="location-date">
                      Added {formatDate(location.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't shared any locations yet.</p>
                <Button onClick={() => window.location.href = '/submit-location'}>
                  Share Your First Location
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            <h3>Your Reviews</h3>
            {userReviews.length > 0 ? (
              <div className="review-list">
                {userReviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      <div className="review-date">{formatDate(review.createdAt)}</div>
                    </div>
                    <h4 className="review-title">{review.title}</h4>
                    <p className="review-content">{review.content}</p>
                    <div className="review-stats">
                      <span className="helpful-votes">{review.helpfulVotes} found this helpful</span>
                      <span className="visit-date">Visited {formatDate(review.visitDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't written any reviews yet.</p>
                <p>Visit some locations and share your experiences!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="saved-tab">
            <h3>Your Wishlist</h3>
            {savedLocations.length > 0 ? (
              <div className="saved-grid">
                {savedLocations.map((location) => (
                  <div key={location.id} className="saved-card">
                    <div className="saved-header">
                      <h4>{location.name}</h4>
                      <button
                        className="remove-saved"
                        onClick={() => handleRemoveFromSaved(location.id)}
                        title="Remove from saved"
                      >
                        ×
                      </button>
                    </div>
                    <p className="saved-description">{location.description}</p>
                    <div className="saved-stats">
                      <div className="rating">
                        {renderStars(Math.round(location.averageRating))}
                        <span>{location.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="review-count">{location.reviewCount} reviews</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't saved any locations yet.</p>
                <p>Explore and save interesting places to visit later!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-tab">
            <UserMessaging />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="community-tab">
            <div className="community-content">
              <div className="community-section">
                <ReputationDisplay showHistory={true} />
              </div>
              <div className="community-section">
                <UserFollowing 
                  onStartConversation={async (userId) => {
                    await messagingService.startConversation(userId);
                    setActiveTab('messages');
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;