// Community service for user following, notifications, and reputation
import type { User, UserFollow, Notification } from '../types';

export interface FollowData {
  followingId: string;
}

export interface ReputationUpdate {
  userId: string;
  action: 'helpful_review' | 'quality_location' | 'verified_local' | 'active_contributor';
  points: number;
}

class CommunityService {
  private follows: Map<string, UserFollow[]> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  private reputationHistory: Map<string, ReputationUpdate[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Initialize mock data
  private initializeMockData(): void {
    // Mock follows
    const mockFollows: UserFollow[] = [
      {
        id: 'follow_1',
        followerId: 'current_user',
        followingId: 'user_2',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'follow_2',
        followerId: 'current_user',
        followingId: 'user_3',
        createdAt: new Date('2024-02-01'),
      },
      {
        id: 'follow_3',
        followerId: 'user_2',
        followingId: 'current_user',
        createdAt: new Date('2024-01-20'),
      },
    ];

    // Group follows by follower
    mockFollows.forEach(follow => {
      const userFollows = this.follows.get(follow.followerId) || [];
      userFollows.push(follow);
      this.follows.set(follow.followerId, userFollows);
    });

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        userId: 'current_user',
        type: 'follow',
        title: 'New Follower',
        message: 'maria_local started following you',
        read: false,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: 'notif_2',
        userId: 'current_user',
        type: 'new-recommendation',
        title: 'New Recommendation',
        message: 'alex_traveler shared a new location in your area of interest',
        read: false,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
      {
        id: 'notif_3',
        userId: 'current_user',
        type: 'new-review',
        title: 'New Review',
        message: 'Someone reviewed your recommended location "Hidden Waterfall Trail"',
        read: true,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];

    this.notifications.set('current_user', mockNotifications);

    // Mock reputation history
    const mockReputationHistory: ReputationUpdate[] = [
      {
        userId: 'current_user',
        action: 'helpful_review',
        points: 5,
      },
      {
        userId: 'current_user',
        action: 'quality_location',
        points: 10,
      },
      {
        userId: 'current_user',
        action: 'verified_local',
        points: 15,
      },
    ];

    this.reputationHistory.set('current_user', mockReputationHistory);
  }

  // Follow a user
  async followUser(data: FollowData): Promise<UserFollow> {
    try {
      // Check if already following
      const userFollows = this.follows.get('current_user') || [];
      const existingFollow = userFollows.find(f => f.followingId === data.followingId);
      
      if (existingFollow) {
        throw new Error('Already following this user');
      }

      const newFollow: UserFollow = {
        id: `follow_${Date.now()}`,
        followerId: 'current_user',
        followingId: data.followingId,
        createdAt: new Date(),
      };

      userFollows.push(newFollow);
      this.follows.set('current_user', userFollows);

      // Create notification for followed user
      await this.createNotification({
        userId: data.followingId,
        type: 'follow',
        title: 'New Follower',
        message: 'Someone started following you',
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return newFollow;
    } catch (error) {
      throw new Error('Failed to follow user');
    }
  }

  // Unfollow a user
  async unfollowUser(followingId: string): Promise<void> {
    try {
      const userFollows = this.follows.get('current_user') || [];
      const updatedFollows = userFollows.filter(f => f.followingId !== followingId);
      this.follows.set('current_user', updatedFollows);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      throw new Error('Failed to unfollow user');
    }
  }

  // Get users that current user is following
  async getFollowing(): Promise<User[]> {
    try {
      const userFollows = this.follows.get('current_user') || [];
      
      // Mock user data for followed users
      const mockUsers: Record<string, User> = {
        user_2: {
          id: 'user_2',
          username: 'maria_local',
          email: 'maria@example.com',
          userType: 'local',
          profile: {
            bio: 'Local guide in Costa Rica, passionate about sharing hidden gems',
            location: 'San José, Costa Rica',
            expertise: ['nature', 'adventure', 'culture'],
            avatar: '/avatars/maria.jpg',
          },
          reputation: 85,
          joinedAt: new Date('2023-06-15'),
        },
        user_3: {
          id: 'user_3',
          username: 'alex_traveler',
          email: 'alex@example.com',
          userType: 'traveler',
          profile: {
            bio: 'Digital nomad exploring hidden gems around the world',
            location: 'Currently in Thailand',
            expertise: ['culture', 'food', 'local-life'],
            avatar: '/avatars/alex.jpg',
          },
          reputation: 72,
          joinedAt: new Date('2023-08-20'),
        },
      };

      const followingUsers = userFollows.map(follow => mockUsers[follow.followingId]).filter(Boolean);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return followingUsers;
    } catch (error) {
      throw new Error('Failed to load following users');
    }
  }

  // Get users following current user
  async getFollowers(): Promise<User[]> {
    try {
      const followers: User[] = [];
      
      // Find all follows where current user is being followed
      for (const [userId, userFollows] of this.follows) {
        const followsCurrentUser = userFollows.find(f => f.followingId === 'current_user');
        if (followsCurrentUser && userId !== 'current_user') {
          // Mock follower data
          const mockFollower: User = {
            id: userId,
            username: `user_${userId}`,
            email: `${userId}@example.com`,
            userType: 'traveler',
            profile: {
              bio: 'Travel enthusiast',
              location: 'Unknown',
              expertise: ['culture'],
            },
            reputation: 50,
            joinedAt: new Date('2023-01-01'),
          };
          followers.push(mockFollower);
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return followers;
    } catch (error) {
      throw new Error('Failed to load followers');
    }
  }

  // Check if current user is following another user
  async isFollowing(userId: string): Promise<boolean> {
    try {
      const userFollows = this.follows.get('current_user') || [];
      return userFollows.some(f => f.followingId === userId);
    } catch (error) {
      return false;
    }
  }

  // Get notifications for current user
  async getNotifications(): Promise<Notification[]> {
    try {
      const userNotifications = this.notifications.get('current_user') || [];
      
      // Sort by creation date (newest first)
      const sortedNotifications = [...userNotifications].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      return sortedNotifications;
    } catch (error) {
      throw new Error('Failed to load notifications');
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const userNotifications = this.notifications.get('current_user') || [];
      const notification = userNotifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.read = true;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const userNotifications = this.notifications.get('current_user') || [];
      userNotifications.forEach(notification => {
        notification.read = true;
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Create a new notification
  async createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    try {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        ...data,
        read: false,
        createdAt: new Date(),
      };

      const userNotifications = this.notifications.get(data.userId) || [];
      userNotifications.unshift(newNotification);
      this.notifications.set(data.userId, userNotifications);

      return newNotification;
    } catch (error) {
      throw new Error('Failed to create notification');
    }
  }

  // Update user reputation
  async updateReputation(data: ReputationUpdate): Promise<number> {
    try {
      const userHistory = this.reputationHistory.get(data.userId) || [];
      userHistory.push(data);
      this.reputationHistory.set(data.userId, userHistory);

      // Calculate total reputation
      const totalReputation = userHistory.reduce((sum, update) => sum + update.points, 0);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      return totalReputation;
    } catch (error) {
      throw new Error('Failed to update reputation');
    }
  }

  // Get reputation history for user
  async getReputationHistory(userId: string = 'current_user'): Promise<ReputationUpdate[]> {
    try {
      const history = this.reputationHistory.get(userId) || [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      return [...history];
    } catch (error) {
      throw new Error('Failed to load reputation history');
    }
  }

  // Get unread notification count
  getUnreadNotificationCount(): number {
    const userNotifications = this.notifications.get('current_user') || [];
    return userNotifications.filter(n => !n.read).length;
  }

  // Get follow counts
  async getFollowCounts(userId: string = 'current_user'): Promise<{ following: number; followers: number }> {
    try {
      const following = this.follows.get(userId)?.length || 0;
      
      let followers = 0;
      for (const userFollows of this.follows.values()) {
        if (userFollows.some(f => f.followingId === userId)) {
          followers++;
        }
      }

      return { following, followers };
    } catch (error) {
      return { following: 0, followers: 0 };
    }
  }
}

// Export singleton instance
const communityService = new CommunityService();
export default communityService;