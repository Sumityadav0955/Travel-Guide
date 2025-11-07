// Register page component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAuth from '../components/user/UserAuth';
import { ROUTES } from '../constants/routes';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful registration
    navigate(ROUTES.DASHBOARD);
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    // Update URL without page reload
    navigate(mode === 'login' ? ROUTES.LOGIN : ROUTES.REGISTER, { replace: true });
  };

  return (
    <UserAuth 
      mode={authMode}
      onSuccess={handleAuthSuccess}
      onModeChange={handleModeChange}
    />
  );
};

export default Register;