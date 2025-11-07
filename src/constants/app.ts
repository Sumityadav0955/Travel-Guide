// Application configuration constants
export const APP_CONFIG = {
  NAME: 'Offbeat Travel App',
  VERSION: '1.0.0',
  DESCRIPTION: 'Discover hidden gems and authentic local experiences',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File upload limits
  MAX_FILE_SIZE_MB: 5,
  MAX_FILES_PER_UPLOAD: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Map configuration
  DEFAULT_MAP_ZOOM: 10,
  MAX_MAP_ZOOM: 18,
  MIN_MAP_ZOOM: 2,
  
  // Search configuration
  MIN_SEARCH_QUERY_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  
  // Rating system
  MIN_RATING: 1,
  MAX_RATING: 5,
  
  // Review system
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 2000,
  
  // Location submission
  MIN_LOCATION_NAME_LENGTH: 3,
  MAX_LOCATION_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;

// Location categories
export const LOCATION_CATEGORIES = {
  NATURE: 'nature',
  CULTURE: 'culture',
  FOOD: 'food',
  ADVENTURE: 'adventure',
  HISTORY: 'history',
  ART: 'art',
  LOCAL_LIFE: 'local-life',
  HIDDEN_GEM: 'hidden-gem',
} as const;

// User types
export const USER_TYPES = {
  LOCAL: 'local',
  TRAVELER: 'traveler',
  BOTH: 'both',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_RECOMMENDATION: 'new-recommendation',
  NEW_REVIEW: 'new-review',
  MESSAGE: 'message',
  FOLLOW: 'follow',
} as const;

// Sort options
export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  RATING: 'rating',
  RECENCY: 'recency',
  DISTANCE: 'distance',
  POPULARITY: 'popularity',
} as const;

// Storage keys for localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  RECENT_LOCATIONS: 'recent_locations',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to log in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please use supported formats.',
  LOCATION_REQUIRED: 'Location access is required for this feature.',
} as const;