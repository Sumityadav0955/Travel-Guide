import { ENV } from '../config';

// API configuration constants
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // Locations
  LOCATIONS: {
    BASE: '/locations',
    SEARCH: '/locations/search',
    SUBMIT: '/locations/submit',
    BY_ID: (id: string) => `/locations/${id}`,
    REVIEWS: (id: string) => `/locations/${id}/reviews`,
    PHOTOS: (id: string) => `/locations/${id}/photos`,
  },
  
  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_ID: (id: string) => `/reviews/${id}`,
    BY_LOCATION: (locationId: string) => `/reviews/location/${locationId}`,
    BY_USER: (userId: string) => `/reviews/user/${userId}`,
    SUBMIT: '/reviews/submit',
    MODERATE: '/reviews/moderate',
  },
  
  // Media/Photos
  MEDIA: {
    BASE: '/media',
    UPLOAD: '/media/upload',
    BY_ID: (id: string) => `/media/${id}`,
    BY_ENTITY: (entityType: string, entityId: string) => `/media?entityType=${entityType}&entityId=${entityId}`,
    DELETE: (id: string) => `/media/${id}`,
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/${id}/profile`,
    MESSAGES: (id: string) => `/users/${id}/messages`,
    NOTIFICATIONS: (id: string) => `/users/${id}/notifications`,
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Request headers
export const REQUEST_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;