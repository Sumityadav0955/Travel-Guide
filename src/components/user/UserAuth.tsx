// User authentication components - registration and login forms
import React, { useState } from 'react';
import type { UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import authService, { type RegisterData, type LoginCredentials } from '../../services/authService';
import Button from '../common/Button';
import Input from '../common/Input';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
}

const UserAuth: React.FC<AuthFormProps> = ({ mode, onSuccess, onModeChange }) => {
  const { state, login, register, clearError } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Use auth context loading state, but also track local loading for password reset
  const [localLoading, setLocalLoading] = useState(false);
  const loading = state.loading || localLoading;

  // Registration form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    userType: 'traveler',
    profile: {
      bio: '',
      location: '',
      expertise: [],
    },
  });

  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Validate form data
      if (!registerData.username.trim()) {
        throw new Error('Username is required');
      }
      if (!authService.validateEmail(registerData.email)) {
        throw new Error('Please enter a valid email address');
      }
      const passwordValidation = authService.validatePassword(registerData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      if (!registerData.profile.location.trim()) {
        throw new Error('Location is required');
      }

      // Process expertise array
      const expertiseArray = registerData.profile.expertise.length > 0 
        ? registerData.profile.expertise 
        : registerData.profile.bio.split(',').map(item => item.trim()).filter(Boolean);

      const dataToSubmit = {
        ...registerData,
        profile: {
          ...registerData.profile,
          expertise: expertiseArray,
        },
      };

      await register(dataToSubmit);
      onSuccess();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration error:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (!authService.validateEmail(loginData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!loginData.password) {
        throw new Error('Password is required');
      }

      await login(loginData);
      onSuccess();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error:', err);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      if (!authService.validateEmail(resetEmail)) {
        throw new Error('Please enter a valid email address');
      }

      await authService.requestPasswordReset(resetEmail);
      alert('Password reset instructions have been sent to your email.');
      setShowPasswordReset(false);
      setResetEmail('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLocalLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Reset Password</h2>
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            {/* Error handled by auth context */}

            <div className="form-actions">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowPasswordReset(false)}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Join Offbeat Travel</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <Input
                type="text"
                placeholder="Choose a username"
                value={registerData.username}
                onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                placeholder="Create a strong password"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <small className="form-hint">
                Must be at least 8 characters with uppercase, lowercase, and number
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="userType">I am a...</label>
              <select
                value={registerData.userType}
                onChange={(e) => setRegisterData(prev => ({ 
                  ...prev, 
                  userType: e.target.value as UserType 
                }))}
                className="form-select"
              >
                <option value="traveler">Traveler - Looking for unique destinations</option>
                <option value="local">Local - Want to share hidden gems</option>
                <option value="both">Both - Traveler and Local</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <Input
                type="text"
                placeholder="City, Country"
                value={registerData.profile.location}
                onChange={(e) => setRegisterData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, location: e.target.value }
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                placeholder="Tell us about yourself and your travel interests..."
                value={registerData.profile.bio}
                onChange={(e) => setRegisterData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, bio: e.target.value }
                }))}
                className="form-textarea"
                rows={3}
              />
            </div>

            {registerData.userType === 'local' || registerData.userType === 'both' ? (
              <div className="form-group">
                <label htmlFor="expertise">Areas of Expertise</label>
                <Input
                  type="text"
                  placeholder="e.g., Food, History, Nature (comma-separated)"
                  value={registerData.profile.expertise.join(', ')}
                  onChange={(e) => setRegisterData(prev => ({ 
                    ...prev, 
                    profile: { 
                      ...prev.profile, 
                      expertise: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    }
                  }))}
                />
              </div>
            ) : null}

            {state.error && <div className="error-message">{state.error}</div>}

            <div className="form-actions">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="auth-switch">
            Already have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={() => onModeChange('login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          {state.error && <div className="error-message">{state.error}</div>}

          <div className="form-actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>

          <div className="auth-links">
            <button 
              type="button" 
              className="link-button"
              onClick={() => setShowPasswordReset(true)}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={() => onModeChange('register')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;