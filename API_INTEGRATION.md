# API Integration Guide

This document explains how the constants, API utilities, and services are wired together in the Offbeat Travel App.

## Overview

The application uses a centralized approach for API configuration and constants, making it easy to maintain and update endpoints, error messages, and configuration values.

## Structure

```
src/
├── constants/
│   ├── api.ts          # API endpoints and HTTP constants
│   ├── app.ts          # Application configuration and constants
│   ├── routes.ts       # Route path constants
│   └── index.ts        # Barrel export
├── config/
│   ├── environment.ts  # Environment configuration
│   └── index.ts        # Barrel export
├── utils/
│   ├── api.ts          # API utility functions and error handling
│   └── index.ts        # Barrel export
└── services/
    ├── authService.ts      # Authentication service
    ├── locationService.ts  # Location management service
    ├── mediaService.ts     # Media/photo upload service
    ├── reviewService.ts    # Review management service
    └── index.ts           # Barrel export
```

## Key Features

### 1. Centralized Constants

**API Configuration (`src/constants/api.ts`)**
- `API_CONFIG`: Base URL, timeout, retry attempts
- `API_ENDPOINTS`: All API endpoints organized by feature
- `HTTP_STATUS`: Standard HTTP status codes
- `CONTENT_TYPES`: Content type constants

**Application Constants (`src/constants/app.ts`)**
- `APP_CONFIG`: File upload limits, pagination, validation rules
- `LOCATION_CATEGORIES`: Available location categories
- `ERROR_MESSAGES`: User-friendly error messages
- `STORAGE_KEYS`: localStorage key constants

### 2. Environment Configuration

**Environment Variables (`src/config/environment.ts`)**
- Handles different environments (development, production, test)
- Validates required environment variables
- Provides feature flags for conditional functionality

**Example `.env` file:**
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_MAP_API_KEY=your_map_api_key_here
REACT_APP_ENVIRONMENT=development
```

### 3. API Utility Functions

**Centralized API Client (`src/utils/api.ts`)**
- `api.get()`, `api.post()`, `api.put()`, `api.patch()`, `api.delete()`
- Automatic authentication header injection
- Standardized error handling with `ApiError` class
- Request timeout and retry logic
- File upload with progress tracking

**Usage Example:**
```typescript
import { api, ApiError } from '../utils/api';
import { API_ENDPOINTS } from '../constants';

try {
  const response = await api.get<Location[]>(API_ENDPOINTS.LOCATIONS.BASE);
  return response.data;
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
  }
  throw error;
}
```

### 4. Service Integration

**Media Service Example:**
```typescript
// Using constants for validation
validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!APP_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }
  // ... rest of validation
}

// Using API utility for uploads
async uploadPhoto(file: File, entityType: string, entityId: string): Promise<UploadResult> {
  try {
    const response = await uploadFile(
      API_ENDPOINTS.MEDIA.UPLOAD,
      file,
      { entityType, entityId }
    );
    return { success: true, photo: response.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : ERROR_MESSAGES.SERVER_ERROR
    };
  }
}
```

## Benefits

### 1. Maintainability
- Single source of truth for all constants
- Easy to update API endpoints across the entire application
- Consistent error messages and validation rules

### 2. Type Safety
- TypeScript interfaces for all API responses
- Strongly typed constants prevent typos
- Compile-time validation of endpoint usage

### 3. Error Handling
- Centralized error mapping from HTTP status codes
- User-friendly error messages
- Consistent error handling across all services

### 4. Environment Management
- Easy switching between development/production APIs
- Feature flags for conditional functionality
- Environment validation on startup

### 5. Developer Experience
- Auto-completion for all endpoints and constants
- Consistent API patterns across services
- Built-in request/response logging in development

## Usage Patterns

### 1. Adding New API Endpoints
```typescript
// 1. Add to constants/api.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  NEW_FEATURE: {
    BASE: '/new-feature',
    BY_ID: (id: string) => `/new-feature/${id}`,
  },
};

// 2. Use in service
import { API_ENDPOINTS } from '../constants';
import { api } from '../utils/api';

async getNewFeature(id: string) {
  const response = await api.get(API_ENDPOINTS.NEW_FEATURE.BY_ID(id));
  return response.data;
}
```

### 2. Adding New Configuration
```typescript
// 1. Add to constants/app.ts
export const APP_CONFIG = {
  // ... existing config
  NEW_FEATURE_LIMIT: 100,
  NEW_FEATURE_ENABLED: true,
} as const;

// 2. Use in components
import { APP_CONFIG } from '../constants';

if (APP_CONFIG.NEW_FEATURE_ENABLED) {
  // Feature implementation
}
```

### 3. Environment-Specific Configuration
```typescript
// 1. Add environment variable
REACT_APP_NEW_FEATURE_API_URL=https://api.example.com

// 2. Add to config/environment.ts
export const ENV = {
  // ... existing config
  NEW_FEATURE_API_URL: getEnvVar('REACT_APP_NEW_FEATURE_API_URL', ''),
} as const;

// 3. Use in constants/api.ts
import { ENV } from '../config';

export const API_CONFIG = {
  // ... existing config
  NEW_FEATURE_BASE_URL: ENV.NEW_FEATURE_API_URL,
} as const;
```

## Best Practices

1. **Always use constants** instead of hardcoded strings
2. **Centralize error handling** through the API utility
3. **Validate environment variables** on application startup
4. **Use TypeScript interfaces** for all API responses
5. **Handle loading and error states** consistently
6. **Log API errors** in development for debugging
7. **Use feature flags** for conditional functionality
8. **Keep constants organized** by feature/domain

This architecture provides a solid foundation for API integration that scales well as the application grows.