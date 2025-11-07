// Main layout component with navigation
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import Button from '../common/Button';
import NotificationCenter from '../common/NotificationCenter';
import MessageNotification from '../common/MessageNotification';
import { useCommunity } from '../../hooks/useCommunity';
import { useMessaging } from '../../hooks/useMessaging';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadNotificationCount } = useCommunity();
  const { } = useMessaging();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to={ROUTES.HOME} className="brand-link">
              Offbeat Travel
            </Link>
          </div>
          
          <div className="nav-links">
            <Link to={ROUTES.SEARCH} className="nav-link">
              Discover
            </Link>
            
            {state.isAuthenticated ? (
              <>
                <Link to={ROUTES.SUBMIT_LOCATION} className="nav-link">
                  Share Location
                </Link>
                <Link to={ROUTES.DASHBOARD} className="nav-link">
                  Dashboard
                </Link>
                
                {/* Notification Bell */}
                <div className="nav-notification">
                  <button 
                    className="notification-button"
                    onClick={() => setShowNotifications(true)}
                  >
                    🔔
                    {unreadNotificationCount > 0 && (
                      <span className="notification-badge">{unreadNotificationCount}</span>
                    )}
                  </button>
                </div>

                {/* Message Notification */}
                <div className="nav-message">
                  <MessageNotification />
                </div>
                
                <Link to={`${ROUTES.PROFILE}/${state.user?.id}`} className="nav-link">
                  Profile
                </Link>
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="nav-link">
                  Sign In
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary">Join Now</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      
      <main className="app-main">{children}</main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2024 Offbeat Travel. Discover hidden gems with locals.</p>
        </div>
      </footer>

      {/* Notification Center */}
      {state.isAuthenticated && (
        <NotificationCenter 
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Layout;