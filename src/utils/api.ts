// API utility functions for making HTTP requests
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, CONTENT_TYPES, REQUEST_HEADERS, STORAGE_KEYS } from '../constants';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requireAuth?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Create request headers with authentication and content type
 */
function createHeaders(options: ApiRequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    [REQUEST_HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
    ...options.headers,
  };

  // Add authentication header if required
  if (options.requireAuth !== false) {
    const token = getAuthToken();
    if (token) {
      headers[REQUEST_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
    }
  }

  // Add content type for requests with body (except FormData)
  if (options.body && !(options.body instanceof FormData)) {
    headers[REQUEST_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.JSON;
  }

  return headers;
}

/**
 * Process request body based on content type
 */
function processBody(body: any, headers: Record<string, string>): string | FormData | null {
  if (!body) return null;
  
  if (body instanceof FormData) {
    return body;
  }
  
  if (headers[REQUEST_HEADERS.CONTENT_TYPE] === CONTENT_TYPES.JSON) {
    return JSON.stringify(body);
  }
  
  return body;
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const { status, statusText } = response;
  
  // Handle different response types
  let data: T;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = (await response.text()) as unknown as T;
  }

  if (!response.ok) {
    // Map HTTP status codes to user-friendly messages
    let errorMessage: string = ERROR_MESSAGES.SERVER_ERROR;
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case HTTP_STATUS.FORBIDDEN:
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        break;
      case HTTP_STATUS.NOT_FOUND:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      default:
        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
    }

    // Use server error message if available
    if (data && typeof data === 'object' && 'message' in data) {
      errorMessage = (data as any).message;
    }

    throw new ApiError(errorMessage, status, statusText, data);
  }

  return { data, status, statusText };
}

/**
 * Make an API request with timeout and error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    timeout = API_CONFIG.TIMEOUT,
    ...requestOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = createHeaders(options);
  const body = processBody(options.body, headers);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      ...requestOptions,
    });

    clearTimeout(timeoutId);
    return await handleResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'Request Timeout');
      }
      
      // Network error
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, 'Network Error');
    }
    
    throw new ApiError(ERROR_MESSAGES.SERVER_ERROR, 500, 'Unknown Error');
  }
}

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Upload file with progress tracking
 */
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>,
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('file', file);
    
    // Add additional form data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            data,
            status: xhr.status,
            statusText: xhr.statusText,
          });
        } catch (error) {
          resolve({
            data: xhr.responseText,
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      } else {
        reject(new ApiError(
          ERROR_MESSAGES.SERVER_ERROR,
          xhr.status,
          xhr.statusText
        ));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError(
        ERROR_MESSAGES.NETWORK_ERROR,
        0,
        'Network Error'
      ));
    });

    xhr.addEventListener('timeout', () => {
      reject(new ApiError(
        'Upload timeout',
        408,
        'Request Timeout'
      ));
    });

    // Set timeout
    xhr.timeout = API_CONFIG.TIMEOUT;

    // Add auth header if available
    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader(REQUEST_HEADERS.AUTHORIZATION, `Bearer ${token}`);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
    xhr.open('POST', url);
    xhr.send(formData);
  });
}