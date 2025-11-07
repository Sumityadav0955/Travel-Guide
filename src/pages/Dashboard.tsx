// Dashboard page component
import React from 'react';
import { UserDashboard } from '../components/user';
import { useAuth } from '../context/AuthContext';
import '../styles/profile.css';

const Dashboard: React.FC = () => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return (
      <div className="dashboard-error">
        <h1>Access Denied</h1>
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return <UserDashboard />;
};

export default Dashboard;