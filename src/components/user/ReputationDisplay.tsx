// Reputation display component showing user reputation and history
import React, { useState, useEffect } from 'react';
import communityService, { type ReputationUpdate } from '../../services/communityService';
import '../../styles/reputation.css';

interface ReputationDisplayProps {
  userId?: string;
  showHistory?: boolean;
  compact?: boolean;
}

const ReputationDisplay: React.FC<ReputationDisplayProps> = ({ 
  userId = 'current_user', 
  showHistory = false,
  compact = false 
}) => {
  const [reputationHistory, setReputationHistory] = useState<ReputationUpdate[]>([]);
  const [totalReputation, setTotalReputation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showHistory) {
      loadReputationData();
    }
  }, [userId, showHistory]);

  const loadReputationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await communityService.getReputationHistory(userId);
      setReputationHistory(history);
      
      // Calculate total reputation
      const total = history.reduce((sum, update) => sum + update.points, 0);
      setTotalReputation(total);
    } catch (err) {
      setError('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 100) return { level: 'Expert', color: '#059669', icon: '🏆' };
    if (reputation >= 75) return { level: 'Advanced', color: '#3b82f6', icon: '⭐' };
    if (reputation >= 50) return { level: 'Intermediate', color: '#f59e0b', icon: '🌟' };
    if (reputation >= 25) return { level: 'Beginner', color: '#6b7280', icon: '🔰' };
    return { level: 'New', color: '#9ca3af', icon: '👋' };
  };

  const getActionDescription = (action: ReputationUpdate['action']) => {
    switch (action) {
      case 'helpful_review':
        return 'Helpful review received';
      case 'quality_location':
        return 'Quality location shared';
      case 'verified_local':
        return 'Local expertise verified';
      case 'active_contributor':
        return 'Active community participation';
      default:
        return 'Community contribution';
    }
  };

  const getActionIcon = (action: ReputationUpdate['action']) => {
    switch (action) {
      case 'helpful_review':
        return '👍';
      case 'quality_location':
        return '📍';
      case 'verified_local':
        return '✅';
      case 'active_contributor':
        return '🎯';
      default:
        return '⭐';
    }
  };

  const reputationLevel = getReputationLevel(totalReputation);

  if (compact) {
    return (
      <div className="reputation-compact">
        <span className="reputation-icon">{reputationLevel.icon}</span>
        <span className="reputation-score">{totalReputation}</span>
        <span className="reputation-level" style={{ color: reputationLevel.color }}>
          {reputationLevel.level}
        </span>
      </div>
    );
  }

  return (
    <div className="reputation-display">
      <div className="reputation-header">
        <div className="reputation-score-large">
          <span className="score-icon">{reputationLevel.icon}</span>
          <div className="score-info">
            <div className="score-number">{totalReputation}</div>
            <div className="score-label">Reputation Points</div>
          </div>
        </div>
        
        <div className="reputation-level-badge" style={{ backgroundColor: reputationLevel.color }}>
          {reputationLevel.level}
        </div>
      </div>

      {showHistory && (
        <div className="reputation-history">
          <h4>Reputation History</h4>
          
          {loading ? (
            <div className="loading">Loading reputation history...</div>
          ) : error ? (
            <div className="error">
              {error}
              <button onClick={loadReputationData}>Retry</button>
            </div>
          ) : reputationHistory.length === 0 ? (
            <div className="empty-history">
              <p>No reputation history yet</p>
              <p>Start contributing to the community to earn reputation points!</p>
            </div>
          ) : (
            <div className="history-list">
              {reputationHistory.map((update, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    {getActionIcon(update.action)}
                  </div>
                  <div className="history-content">
                    <div className="history-description">
                      {getActionDescription(update.action)}
                    </div>
                    <div className="history-points">
                      +{update.points} points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="reputation-info">
        <h5>How to earn reputation:</h5>
        <ul>
          <li><span className="info-icon">👍</span> Receive helpful votes on reviews (+5 points)</li>
          <li><span className="info-icon">📍</span> Share quality locations (+10 points)</li>
          <li><span className="info-icon">✅</span> Get verified as a local expert (+15 points)</li>
          <li><span className="info-icon">🎯</span> Active community participation (+3 points)</li>
        </ul>
      </div>
    </div>
  );
};

export default ReputationDisplay;