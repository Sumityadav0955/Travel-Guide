// Authentication service for user registration, login, and session management
import type { User, UserType } from '../types';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  userType: UserType;
  profile: {
    bio: string;
    location: string;
    expertise: string[];
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage on service creation
    this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Mock implementation - replace with actual API call
      const mockUser: User = {
        id: `user_${Date.now()}`,
        username: data.username,
        email: data.email,
        userType: data.userType,
        profile: {
          ...data.profile,
          avatar: undefined,
        },
        reputation: 0,
        joinedAt: new Date(),
      };

      const mockToken = `mock_token_${Date.now()}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store token
      this.token = mockToken;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      return {
        user: mockUser,
        token: mockToken,
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Mock implementation - replace with actual API call
      const storedUserData = localStorage.getItem('user_data');
      
      if (storedUserData) {
        const user = JSON.parse(storedUserData) as User;
        if (user.email === credentials.email) {
          const mockToken = `mock_token_${Date.now()}`;
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          this.token = mockToken;
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
          
          return {
            user,
            token: mockToken,
          };
        }
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem('user_data');
      this.token = null;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      throw new Error('Logout failed. Please try again.');
    }
  }

  // Get current user from stored data
  getCurrentUser(): User | null {
    try {
      const storedUserData = localStorage.getItem('user_data');
      return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!localStorage.getItem('user_data');
  }

  // Get auth token
  getToken(): string | null {
    return this.token;
  }

  // Password reset (mock implementation)
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success - in real implementation, this would send an email
      console.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      throw new Error('Password reset request failed. Please try again.');
    }
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }
    return { isValid: true };
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;