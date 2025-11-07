// Core type definitions for the Offbeat Travel App

export type LocationCategory = 
  | 'nature'
  | 'culture'
  | 'food'
  | 'adventure'
  | 'history'
  | 'art'
  | 'local-life'
  | 'hidden-gem';

export type UserType = 'local' | 'traveler' | 'both';

export interface Photo {
  id: string;
  entityType: 'location' | 'review';
  entityId: string;
  filePath: string;
  caption?: string;
  uploadDate: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  userType: UserType;
  profile: {
    bio: string;
    location: string;
    expertise: string[];
    avatar?: string;
  };
  reputation: number;
  joinedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  specialtyDescription: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: LocationCategory;
  submittedBy: string;
  photos: Photo[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  verified: boolean;
}

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  photos: Photo[];
  visitDate: Date;
  createdAt: Date;
  helpfulVotes: number;
}

export interface SearchFilters {
  query?: string;
  category?: LocationCategory;
  region?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'recency';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new-recommendation' | 'new-review' | 'message' | 'follow';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: Date;
  unreadCount: number;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface ConversationWithUsers extends Conversation {
  otherUser: User;
}

// Application state interfaces
export interface AppState {
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    loading: boolean;
  };
  locations: {
    items: Location[];
    selectedLocation: Location | null;
    searchFilters: SearchFilters;
    loading: boolean;
  };
  reviews: {
    items: Review[];
    loading: boolean;
  };
  ui: {
    mapView: boolean;
    sidebarOpen: boolean;
    notifications: Notification[];
  };
}