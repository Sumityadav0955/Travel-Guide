// Protected route wrapper component
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = ROUTES.LOGIN 
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (state.loading) {
    return <Loading message="Checking authentication..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !state.isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && state.isAuthenticated) {
    // Redirect authenticated users away from login/register pages
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
};

export default ProtectedRoute;