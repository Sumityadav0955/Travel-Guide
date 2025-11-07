// Custom hook for community features (following, notifications, reputation)
import { useState, useEffect, useCallback } from 'react';
import type { User, Notification } from '../types';
import communityService, { type ReputationUpdate } from '../services/communityService';

export const useCommunity = () => {
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [followCounts, setFollowCounts] = useState({ following: 0, followers: 0 });
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all community data
  const loadCommunityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [followingUsers, followerUsers, notifs, counts] = await Promise.all([
        communityService.getFollowing(),
        communityService.getFollowers(),
        communityService.getNotifications(),
        communityService.getFollowCounts(),
      ]);
      
      setFollowing(followingUsers);
      setFollowers(followerUsers);
      setNotifications(notifs);
      setFollowCounts(counts);
      
      // Update unread count
      const unreadCount = communityService.getUnreadNotificationCount();
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      setError('Failed to load community data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Follow a user
  const followUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      await communityService.followUser({ followingId: userId });
      
      // Reload data to get updated lists
      await loadCommunityData();
    } catch (err) {
      setError('Failed to follow user');
      throw err;
    }
  }, [loadCommunityData]);

  // Unfollow a user
  const unfollowUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      await communityService.unfollowUser(userId);
      
      // Update local state
      setFollowing(prev => prev.filter(user => user.id !== userId));
      setFollowCounts(prev => ({ ...prev, following: prev.following - 1 }));
    } catch (err) {
      setError('Failed to unfollow user');
      throw err;
    }
  }, []);

  // Check if following a user
  const isFollowing = useCallback(async (userId: string) => {
    try {
      return await communityService.isFollowing(userId);
    } catch (err) {
      return false;
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await communityService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count
      const unreadCount = communityService.getUnreadNotificationCount();
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      setError(null);
      await communityService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setUnreadNotificationCount(0);
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  }, []);

  // Update reputation
  const updateReputation = useCallback(async (data: ReputationUpdate) => {
    try {
      setError(null);
      const newReputation = await communityService.updateReputation(data);
      return newReputation;
    } catch (err) {
      setError('Failed to update reputation');
      throw err;
    }
  }, []);

  // Create notification
  const createNotification = useCallback(async (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      setError(null);
      const notification = await communityService.createNotification(data);
      
      // If notification is for current user, update local state
      if (data.userId === 'current_user') {
        setNotifications(prev => [notification, ...prev]);
        setUnreadNotificationCount(prev => prev + 1);
      }
      
      return notification;
    } catch (err) {
      setError('Failed to create notification');
      throw err;
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  return {
    // Data
    following,
    followers,
    notifications,
    followCounts,
    unreadNotificationCount,
    loading,
    error,
    
    // Actions
    loadCommunityData,
    followUser,
    unfollowUser,
    isFollowing,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateReputation,
    createNotification,
    
    // Utilities
    clearError: () => setError(null),
  };
};