// Notification center component for displaying user notifications
import React, { useState, useEffect } from 'react';
import type { Notification } from '../../types';
import communityService from '../../services/communityService';
import '../../styles/notifications.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const notifs = await communityService.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await communityService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await communityService.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = (now.getTime() - notifDate.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return notifDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return '👥';
      case 'new-recommendation':
        return '📍';
      case 'new-review':
        return '⭐';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Notifications</h3>
          <div className="notification-actions">
            {notifications.some(n => !n.read) && (
              <button onClick={handleMarkAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="close-button">×</button>
          </div>
        </div>

        <div className="notification-content">
          {loading ? (
            <div className="notification-loading">Loading notifications...</div>
          ) : error ? (
            <div className="notification-error">
              {error}
              <button onClick={loadNotifications}>Retry</button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-icon">🔔</div>
              <p>No notifications yet</p>
              <p>We'll notify you when something interesting happens!</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.read && <div className="unread-indicator" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;