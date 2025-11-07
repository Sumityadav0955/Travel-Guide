// User following component for managing followed users and followers
import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import communityService from '../../services/communityService';
import Button from '../common/Button';
import '../../styles/following.css';

interface UserFollowingProps {
  onStartConversation?: (userId: string) => void;
}

const UserFollowing: React.FC<UserFollowingProps> = ({ onStartConversation }) => {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [followCounts, setFollowCounts] = useState({ following: 0, followers: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFollowData();
  }, []);

  const loadFollowData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [followingUsers, followerUsers, counts] = await Promise.all([
        communityService.getFollowing(),
        communityService.getFollowers(),
        communityService.getFollowCounts(),
      ]);
      
      setFollowing(followingUsers);
      setFollowers(followerUsers);
      setFollowCounts(counts);
    } catch (err) {
      setError('Failed to load follow data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await communityService.unfollowUser(userId);
      setFollowing(prev => prev.filter(user => user.id !== userId));
      setFollowCounts(prev => ({ ...prev, following: prev.following - 1 }));
    } catch (err) {
      setError('Failed to unfollow user');
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await communityService.followUser({ followingId: userId });
      // Reload data to get updated lists
      await loadFollowData();
    } catch (err) {
      setError('Failed to follow user');
    }
  };

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(date));
  };

  const renderUserCard = (user: User, showUnfollowButton: boolean = false) => (
    <div key={user.id} className="user-card">
      <div className="user-avatar">
        {user.profile.avatar ? (
          <img src={user.profile.avatar} alt={user.username} />
        ) : (
          <div className="avatar-placeholder">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="user-info">
        <div className="user-header">
          <h4 className="username">{user.username}</h4>
          <span className="user-type">{user.userType}</span>
        </div>
        
        <p className="user-bio">{user.profile.bio}</p>
        
        <div className="user-details">
          <div className="user-location">📍 {user.profile.location}</div>
          <div className="user-reputation">⭐ {user.reputation} reputation</div>
          <div className="user-joined">Joined {formatJoinDate(user.joinedAt)}</div>
        </div>
        
        {user.profile.expertise && user.profile.expertise.length > 0 && (
          <div className="user-expertise">
            {user.profile.expertise.map(skill => (
              <span key={skill} className="expertise-tag">{skill}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="user-actions">
        {showUnfollowButton ? (
          <Button
            variant="secondary"
            onClick={() => handleUnfollow(user.id)}
          >
            Unfollow
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => handleFollow(user.id)}
          >
            Follow Back
          </Button>
        )}
        
        {onStartConversation && (
          <Button
            variant="primary"
            onClick={() => onStartConversation(user.id)}
          >
            Message
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="user-following">
      <div className="following-header">
        <h2>Community</h2>
        <p>Connect with fellow travelers and locals</p>
      </div>

      {/* Tab Navigation */}
      <div className="following-tabs">
        <button
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following ({followCounts.following})
        </button>
        <button
          className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Followers ({followCounts.followers})
        </button>
      </div>

      {/* Content */}
      <div className="following-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <Button onClick={loadFollowData}>Try Again</Button>
          </div>
        ) : (
          <>
            {activeTab === 'following' && (
              <div className="following-list">
                {following.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>Not following anyone yet</h3>
                    <p>Start following other users to see their recommendations and updates here.</p>
                  </div>
                ) : (
                  <div className="user-grid">
                    {following.map(user => renderUserCard(user, true))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="followers-list">
                {followers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No followers yet</h3>
                    <p>Share great recommendations and reviews to attract followers!</p>
                  </div>
                ) : (
                  <div className="user-grid">
                    {followers.map(user => renderUserCard(user, false))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default UserFollowing;